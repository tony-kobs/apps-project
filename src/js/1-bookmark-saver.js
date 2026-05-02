import * as iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const addBookmarkBtn = document.getElementById('add-bookmark');
const bookmarkList = document.getElementById('bookmark-list');
const bookmarkNameInput = document.getElementById('bookmark-name');
const bookmarkUrlInput = document.getElementById('bookmark-url');
const exportJsonBtn = document.getElementById('export-json');
const importJsonInput = document.getElementById('import-json');
const importChromeInput = document.getElementById('import-chrome');
const bookmarkSearchInput = document.getElementById('bookmark-search');

function showToast(message, type = 'success') {
  const config = {
    message,
    position: 'topRight',
    timeout: 2500,
    closeOnClick: true,
    pauseOnHover: true,
    transitionIn: 'fadeInUp',
    transitionOut: 'fadeOutDown',
    progressBar: true,
  };

  if (type === 'error') {
    iziToast.error({
      ...config,
      title: 'Error',
      backgroundColor: '#e74c3c',
      messageColor: '#ffffff',
      titleColor: '#ffffff',
      progressBarColor: '#ffffff',
    });
    return;
  }

  iziToast.success({
    ...config,
    title: 'Success',
    backgroundColor: '#2ecc71',
    messageColor: '#ffffff',
    titleColor: '#ffffff',
    progressBarColor: '#ffffff',
  });
}

document.addEventListener('DOMContentLoaded', loadBookmarks);

addBookmarkBtn.addEventListener('click', function () {
  const name = bookmarkNameInput.value.trim();
  const url = bookmarkUrlInput.value.trim();

  if (!name || !url) {
    showToast('Please enter both name and URL.', 'error');
    return;
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    showToast(
      'Please enter a valid URL starting with http:// or https://',
      'error'
    );
    return;
  }

  const bookmarks = getBookmarksFromStorage();
  const isDuplicate = bookmarks.some(bookmark => bookmark.url === url);

  if (isDuplicate) {
    showToast('This bookmark already exists.', 'error');
    return;
  }

  const createdAt = new Date().toISOString();

  saveBookmark(name, url, createdAt);

  const emptyItem = bookmarkList.querySelector('.bookmark-empty');

  if (emptyItem) {
    emptyItem.remove();
  }

  if (!bookmarkSearchInput.value.trim()) {
    addBookmark(name, url, createdAt, true);
  } else {
    renderBookmarks(getFilteredBookmarks());
  }

  bookmarkNameInput.value = '';
  bookmarkUrlInput.value = '';

  showToast('Bookmark added.', 'success');
});

function addBookmark(name, url, createdAt, toTop = false) {
  const li = document.createElement('li');
  li.setAttribute('draggable', true);
  li.classList.add('bookmark-draggable');

  li.addEventListener('dragstart', () => {
    li.classList.add('dragging');
  });

  li.addEventListener('dragend', () => {
    li.classList.remove('dragging');
    saveOrderToStorage();
  });

  const bookmarkInfo = document.createElement('div');
  bookmarkInfo.classList.add('bookmark-info');

  const favicon = document.createElement('img');
  favicon.classList.add('bookmark-favicon');
  favicon.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url)}&sz=32`;
  favicon.alt = '';
  favicon.loading = 'lazy';

  const link = document.createElement('a');
  link.href = url;
  link.textContent = name;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';

  const date = document.createElement('span');
  date.classList.add('bookmark-date');
  date.textContent = createdAt
    ? `Added: ${new Date(createdAt).toLocaleDateString()}`
    : 'Added: unknown';

  bookmarkInfo.appendChild(link);
  bookmarkInfo.appendChild(date);

  const actions = document.createElement('div');
  actions.classList.add('bookmark-item-actions');

  const copyButton = document.createElement('button');
  copyButton.textContent = 'Copy';
  copyButton.classList.add('bookmark-copy-btn');

  copyButton.addEventListener('click', async function () {
    try {
      await navigator.clipboard.writeText(url);
      showToast('URL copied.', 'success');
    } catch (error) {
      showToast('Copy failed.', 'error');
    }
  });

  const editButton = document.createElement('button');
  editButton.textContent = 'Edit';
  editButton.classList.add('bookmark-edit-btn');

  editButton.addEventListener('click', function () {
    const nameInput = document.createElement('input');
    nameInput.value = name;
    nameInput.classList.add('bookmark-input');

    const urlInput = document.createElement('input');
    urlInput.value = url;
    urlInput.classList.add('bookmark-input');

    bookmarkInfo.innerHTML = '';
    bookmarkInfo.appendChild(nameInput);
    bookmarkInfo.appendChild(urlInput);

    nameInput.focus();

    function saveEdit() {
      const newName = nameInput.value.trim();
      const newUrl = urlInput.value.trim();

      if (!newName || !newUrl) {
        showToast('Invalid data', 'error');
        return;
      }

      updateBookmark(name, url, newName, newUrl);
      renderBookmarks(getFilteredBookmarks());
      showToast('Bookmark updated.');
    }

    function cancelEdit() {
      renderBookmarks(getFilteredBookmarks());
    }

    nameInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') saveEdit();
      if (e.key === 'Escape') cancelEdit();
    });

    urlInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') saveEdit();
      if (e.key === 'Escape') cancelEdit();
    });
  });

  const removeButton = document.createElement('button');
  removeButton.textContent = 'Remove';
  removeButton.addEventListener('click', function () {
    const shouldDelete = confirm(
      'Are you sure you want to delete this bookmark?'
    );

    if (!shouldDelete) return;

    removeBookmarkFromStorage(name, url);
    renderBookmarks(getFilteredBookmarks());
    showToast('Bookmark deleted.', 'success');
  });

  actions.appendChild(editButton);
  actions.appendChild(copyButton);
  actions.appendChild(removeButton);

  const bookmarkContent = document.createElement('div');
  bookmarkContent.classList.add('bookmark-content');

  bookmarkContent.appendChild(favicon);
  bookmarkContent.appendChild(bookmarkInfo);

  li.appendChild(bookmarkContent);
  li.appendChild(actions);

  if (toTop) {
    bookmarkList.prepend(li);
  } else {
    bookmarkList.appendChild(li);
  }
}

function updateBookmark(oldName, oldUrl, newName, newUrl) {
  const bookmarks = getBookmarksFromStorage();

  const updated = bookmarks.map(bookmark => {
    if (bookmark.name === oldName && bookmark.url === oldUrl) {
      return {
        ...bookmark,
        name: newName,
        url: newUrl,
      };
    }
    return bookmark;
  });

  localStorage.setItem('bookmarks', JSON.stringify(updated));
}

function getBookmarksFromStorage() {
  const bookmarks = localStorage.getItem('bookmarks');
  return bookmarks ? JSON.parse(bookmarks) : [];
}

function saveBookmark(name, url, createdAt = new Date().toISOString()) {
  const bookmarks = getBookmarksFromStorage();

  bookmarks.unshift({
    name,
    url,
    createdAt,
  });

  localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}

function loadBookmarks() {
  const bookmarks = getBookmarksFromStorage();
  renderBookmarks(bookmarks);
}

function removeBookmarkFromStorage(name, url) {
  let bookmarks = getBookmarksFromStorage();
  bookmarks = bookmarks.filter(
    bookmark => bookmark.name !== name || bookmark.url !== url
  );
  localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}

/* =======import-export===== */
exportJsonBtn.addEventListener('click', exportBookmarksToJson);
importJsonInput.addEventListener('change', importBookmarksFromJson);
importChromeInput.addEventListener('change', importBookmarksFromChrome);

function exportBookmarksToJson() {
  const bookmarks = getBookmarksFromStorage();

  if (!bookmarks.length) {
    alert('No bookmarks to export.');
    return;
  }

  const json = JSON.stringify(bookmarks, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = 'bookmarks.json';
  downloadLink.click();

  URL.revokeObjectURL(url);
}

function importBookmarksFromJson(event) {
  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const importedBookmarks = JSON.parse(e.target.result);

      if (!Array.isArray(importedBookmarks)) {
        alert('Invalid JSON format.');
        return;
      }

      mergeImportedBookmarks(importedBookmarks);
      event.target.value = '';
    } catch (error) {
      alert('Invalid JSON file.');
    }
  };

  reader.readAsText(file);
}

function importBookmarksFromChrome(event) {
  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    const html = e.target.result;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const importedBookmarks = [...doc.querySelectorAll('a[href]')].map(
      link => ({
        name: link.textContent.trim() || link.href,
        url: link.href,
      })
    );

    if (!importedBookmarks.length) {
      alert('No bookmarks found in this file.');
      return;
    }

    mergeImportedBookmarks(importedBookmarks);
    event.target.value = '';
  };

  reader.readAsText(file);
}

function mergeImportedBookmarks(importedBookmarks) {
  const currentBookmarks = getBookmarksFromStorage();

  const normalizedImportedBookmarks = importedBookmarks
    .filter(bookmark => bookmark.name && bookmark.url)
    .filter(
      bookmark =>
        bookmark.url.startsWith('http://') ||
        bookmark.url.startsWith('https://')
    )
    .map(bookmark => ({
      name: bookmark.name,
      url: bookmark.url,
      createdAt: bookmark.createdAt || new Date().toISOString(),
    }));

  const uniqueBookmarks = normalizedImportedBookmarks.filter(
    importedBookmark => {
      return !currentBookmarks.some(
        currentBookmark => currentBookmark.url === importedBookmark.url
      );
    }
  );

  if (!uniqueBookmarks.length) {
    showToast('No new bookmarks to import.', 'error');
    return;
  }

  const updatedBookmarks = [...uniqueBookmarks, ...currentBookmarks];

  localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));

  renderBookmarks(getFilteredBookmarks());

  showToast(`${uniqueBookmarks.length} bookmarks imported.`, 'success');
}

/* =====search-bookmark===== */
bookmarkSearchInput.addEventListener('input', function () {
  renderBookmarks(getFilteredBookmarks());
});

function getFilteredBookmarks() {
  const query = bookmarkSearchInput.value.trim().toLowerCase();
  const bookmarks = getBookmarksFromStorage();

  if (!query) {
    return bookmarks;
  }

  return bookmarks.filter(bookmark => {
    const name = bookmark.name?.toLowerCase() || '';
    const url = bookmark.url?.toLowerCase() || '';

    return name.includes(query) || url.includes(query);
  });
}

function renderBookmarks(bookmarks) {
  bookmarkList.innerHTML = '';

  if (!bookmarks.length) {
    const emptyItem = document.createElement('li');
    emptyItem.classList.add('bookmark-empty');
    emptyItem.textContent = bookmarkSearchInput.value.trim()
      ? 'No bookmarks found.'
      : 'No bookmarks yet.';

    bookmarkList.appendChild(emptyItem);
    return;
  }

  bookmarks.forEach(bookmark =>
    addBookmark(bookmark.name, bookmark.url, bookmark.createdAt)
  );
}

bookmarkList.addEventListener('dragover', e => {
  e.preventDefault();

  const dragging = document.querySelector('.dragging');
  const afterElement = getDragAfterElement(bookmarkList, e.clientY);

  if (afterElement == null) {
    bookmarkList.appendChild(dragging);
  } else {
    bookmarkList.insertBefore(dragging, afterElement);
  }
});

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll('.bookmark-draggable:not(.dragging)'),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

function saveOrderToStorage() {
  const items = [...bookmarkList.querySelectorAll('li')];

  const newOrder = items.map(li => {
    const name = li.querySelector('a')?.textContent;
    const url = li.querySelector('a')?.href;

    return { name, url };
  });

  const oldBookmarks = getBookmarksFromStorage();

  const updated = newOrder.map(item => {
    const match = oldBookmarks.find(b => b.url === item.url);
    return match;
  });

  localStorage.setItem('bookmarks', JSON.stringify(updated));
}

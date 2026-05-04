import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const addBookmarkBtn = document.getElementById('add-bookmark');
const bookmarkList = document.getElementById('bookmark-list');
const bookmarkNameInput = document.getElementById('bookmark-name');
const bookmarkUrlInput = document.getElementById('bookmark-url');

const exportJsonBtn = document.getElementById('export-json');
const importJsonInput = document.getElementById('import-json');
const importChromeInput = document.getElementById('import-chrome');

const bookmarkSearchInput = document.getElementById('bookmark-search');

const folderNameInput = document.getElementById('folder-name');
const createFolderBtn = document.getElementById('create-folder');
const bookmarkFolders = document.getElementById('bookmark-folders');

const BOOKMARKS_KEY = 'bookmarks';
const FOLDERS_KEY = 'bookmarkFolders';

let activeFolderId = null;

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

document.addEventListener('DOMContentLoaded', function () {
  loadBookmarks();
  renderFolders();
});

const backToMainBtn = document.createElement('button');
backToMainBtn.textContent = '← Back to bookmarks';
backToMainBtn.classList.add('bookmark-back-btn');
backToMainBtn.style.display = 'none';

backToMainBtn.addEventListener('click', () => {
  activeFolderId = null;
  backToMainBtn.style.display = 'none';
  renderBookmarks(getBookmarksFromStorage());
});

bookmarkList.parentElement.prepend(backToMainBtn);

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

  showToast('Bookmark added.');
});

function addBookmark(name, url, createdAt, toTop = false) {
  const li = document.createElement('li');
  li.setAttribute('draggable', true);
  li.classList.add('bookmark-draggable');

  li.addEventListener('dragstart', event => {
    event.dataTransfer.setData(
      'text/plain',
      JSON.stringify({ name, url, createdAt })
    );

    li.classList.add('dragging');
  });

  li.addEventListener('dragend', () => {
    li.classList.remove('dragging');
  });

  const bookmarkContent = document.createElement('div');
  bookmarkContent.classList.add('bookmark-content');

  const favicon = document.createElement('img');
  favicon.classList.add('bookmark-favicon');
  favicon.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url)}&sz=32`;
  favicon.alt = '';
  favicon.loading = 'lazy';

  const bookmarkInfo = document.createElement('div');
  bookmarkInfo.classList.add('bookmark-info');

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

  bookmarkContent.appendChild(favicon);
  bookmarkContent.appendChild(bookmarkInfo);

  const actions = document.createElement('div');
  actions.classList.add('bookmark-item-actions');

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
        showToast('Invalid data.', 'error');
        return;
      }

      if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
        showToast('Please enter a valid URL.', 'error');
        return;
      }

      if (activeFolderId) {
        updateBookmarkInFolder(activeFolderId, url, newName, newUrl);
        const folder = getFoldersFromStorage().find(
          folder => folder.id === activeFolderId
        );
        renderBookmarks(folder ? folder.bookmarks : []);
        renderFolders();
      } else {
        updateBookmark(url, newName, newUrl);
        renderBookmarks(getFilteredBookmarks());
      }

      showToast('Bookmark updated.');
    }

    function cancelEdit() {
      renderBookmarks(getFilteredBookmarks());
    }

    nameInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') saveEdit();
      if (event.key === 'Escape') cancelEdit();
    });

    urlInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') saveEdit();
      if (event.key === 'Escape') cancelEdit();
    });
  });

  const copyButton = document.createElement('button');
  copyButton.textContent = 'Copy';
  copyButton.classList.add('bookmark-copy-btn');

  copyButton.addEventListener('click', async function () {
    try {
      await navigator.clipboard.writeText(url);
      showToast('URL copied.');
    } catch (error) {
      showToast('Copy failed.', 'error');
    }
  });

  const removeButton = document.createElement('button');
  removeButton.textContent = 'Remove';

  removeButton.addEventListener('click', function () {
    const shouldDelete = confirm(
      'Are you sure you want to delete this bookmark?'
    );

    if (!shouldDelete) return;

    if (activeFolderId) {
      removeBookmarkFromFolder(url, activeFolderId);

      const folders = getFoldersFromStorage();
      const activeFolder = folders.find(folder => folder.id === activeFolderId);

      renderBookmarks(activeFolder ? activeFolder.bookmarks : []);
      renderFolders();

      return;
    }

    removeBookmarkFromStorage(name, url);
    renderBookmarks(getFilteredBookmarks());
    showToast('Bookmark deleted.');
  });

  actions.appendChild(editButton);
  actions.appendChild(copyButton);
  actions.appendChild(removeButton);

  li.appendChild(bookmarkContent);
  li.appendChild(actions);

  if (toTop) {
    bookmarkList.prepend(li);
  } else {
    bookmarkList.appendChild(li);
  }
}

function getBookmarksFromStorage() {
  const bookmarks = localStorage.getItem(BOOKMARKS_KEY);
  return bookmarks ? JSON.parse(bookmarks) : [];
}

function saveBookmarksToStorage(bookmarks) {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
}

function saveBookmark(name, url, createdAt = new Date().toISOString()) {
  const bookmarks = getBookmarksFromStorage();

  bookmarks.unshift({
    name,
    url,
    createdAt,
  });

  saveBookmarksToStorage(bookmarks);
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

  saveBookmarksToStorage(bookmarks);
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

/* ===== folders ===== */

createFolderBtn.addEventListener('click', createFolder);

folderNameInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    createFolder();
  }
});

function createFolder() {
  const name = folderNameInput.value.trim();

  if (!name) {
    showToast('Please enter folder name.', 'error');
    return;
  }

  const folders = getFoldersFromStorage();

  const isDuplicate = folders.some(
    folder => folder.name.toLowerCase() === name.toLowerCase()
  );

  if (isDuplicate) {
    showToast('Folder already exists.', 'error');
    return;
  }

  folders.unshift({
    id: crypto.randomUUID(),
    name,
    isOpen: false,
    bookmarks: [],
    createdAt: new Date().toISOString(),
  });

  saveFoldersToStorage(folders);
  folderNameInput.value = '';
  renderFolders();

  showToast('Folder created.');
}

function getFoldersFromStorage() {
  const folders = localStorage.getItem(FOLDERS_KEY);
  return folders ? JSON.parse(folders) : [];
}

function saveFoldersToStorage(folders) {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

function renderFolders() {
  const folders = getFoldersFromStorage();

  bookmarkFolders.innerHTML = '';

  if (!folders.length) {
    const empty = document.createElement('p');
    empty.classList.add('bookmark-folders-empty');
    empty.textContent = 'No folders yet.';
    bookmarkFolders.appendChild(empty);
    return;
  }

  folders.forEach(folder => {
    const folderEl = document.createElement('div');
    folderEl.classList.add('bookmark-folder');
    folderEl.dataset.folderId = folder.id;

    folderEl.addEventListener('dragover', event => {
      event.preventDefault();
      folderEl.classList.add('is-drag-over');
    });

    folderEl.addEventListener('dragleave', () => {
      folderEl.classList.remove('is-drag-over');
    });

    folderEl.addEventListener('drop', event => {
      event.preventDefault();
      folderEl.classList.remove('is-drag-over');

      const data = event.dataTransfer.getData('text/plain');

      if (!data) return;

      const bookmark = JSON.parse(data);

      moveBookmarkToFolder(bookmark, folder.id);
    });

    const folderHeader = document.createElement('button');
    folderHeader.classList.add('bookmark-folder-header');
    folderHeader.type = 'button';

    folderHeader.addEventListener('click', () => {
      openFolder(folder.id);
    });

    const folderIcon = document.createElement('span');
    folderIcon.classList.add('bookmark-folder-icon');

    const folderName = document.createElement('span');
    folderName.classList.add('bookmark-folder-name');
    folderName.textContent = folder.name;

    const folderCount = document.createElement('span');
    folderCount.classList.add('bookmark-folder-count');
    folderCount.textContent = folder.bookmarks.length;

    const deleteFolderBtn = document.createElement('button');
    deleteFolderBtn.classList.add('bookmark-folder-delete');
    deleteFolderBtn.type = 'button';

    deleteFolderBtn.addEventListener('click', event => {
      event.stopPropagation();
      deleteFolder(folder.id);
    });

    folderHeader.appendChild(folderIcon);
    folderHeader.appendChild(folderName);
    folderHeader.appendChild(folderCount);
    folderHeader.appendChild(deleteFolderBtn);

    folderEl.appendChild(folderHeader);
    bookmarkFolders.appendChild(folderEl);
  });
}

function openFolder(folderId) {
  const folders = getFoldersFromStorage();
  const folder = folders.find(f => f.id === folderId);

  if (!folder) return;

  activeFolderId = folderId;

  backToMainBtn.style.display = 'block';

  renderBookmarks(folder.bookmarks);
}

function createFolderBookmarkItem(bookmark, folderId) {
  const li = document.createElement('li');
  li.classList.add('bookmark-folder-item');

  const content = document.createElement('div');
  content.classList.add('bookmark-content');

  const favicon = document.createElement('img');
  favicon.classList.add('bookmark-favicon');
  favicon.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(bookmark.url)}&sz=32`;
  favicon.alt = '';
  favicon.loading = 'lazy';

  const info = document.createElement('div');
  info.classList.add('bookmark-info');

  const link = document.createElement('a');
  link.href = bookmark.url;
  link.textContent = bookmark.name;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';

  const date = document.createElement('span');
  date.classList.add('bookmark-date');
  date.textContent = bookmark.createdAt
    ? `Added: ${new Date(bookmark.createdAt).toLocaleDateString()}`
    : 'Added: unknown';

  info.appendChild(link);
  info.appendChild(date);

  content.appendChild(favicon);
  content.appendChild(info);

  const actions = document.createElement('div');
  actions.classList.add('bookmark-item-actions');

  const copyButton = document.createElement('button');
  copyButton.textContent = 'Copy';
  copyButton.classList.add('bookmark-copy-btn');

  copyButton.addEventListener('click', async function () {
    try {
      await navigator.clipboard.writeText(bookmark.url);
      showToast('URL copied.');
    } catch (error) {
      showToast('Copy failed.', 'error');
    }
  });

  const removeButton = document.createElement('button');
  removeButton.textContent = 'Remove';

  removeButton.addEventListener('click', function () {
    removeBookmarkFromFolder(bookmark.url, folderId);
  });

  actions.appendChild(copyButton);
  actions.appendChild(removeButton);

  li.appendChild(content);
  li.appendChild(actions);

  return li;
}

function toggleFolder(folderId) {
  const folders = getFoldersFromStorage();

  const updatedFolders = folders.map(folder => {
    if (folder.id === folderId) {
      return {
        ...folder,
        isOpen: !folder.isOpen,
      };
    }

    return folder;
  });

  saveFoldersToStorage(updatedFolders);
  renderFolders();
}

function deleteFolder(folderId) {
  const folders = getFoldersFromStorage();
  const folder = folders.find(item => item.id === folderId);

  if (!folder) return;

  const shouldDelete = confirm(
    'Delete this folder? Bookmarks inside will return to the main list.'
  );

  if (!shouldDelete) return;

  const bookmarks = getBookmarksFromStorage();
  const restoredBookmarks = [...folder.bookmarks, ...bookmarks];

  saveBookmarksToStorage(restoredBookmarks);
  saveFoldersToStorage(folders.filter(item => item.id !== folderId));

  renderFolders();
  renderBookmarks(getFilteredBookmarks());

  showToast('Folder deleted.');
}

function moveBookmarkToFolder(bookmark, folderId) {
  const folders = getFoldersFromStorage();

  const updatedFolders = folders.map(folder => {
    if (folder.id !== folderId) return folder;

    const existsInFolder = folder.bookmarks.some(
      item => item.url === bookmark.url
    );

    if (existsInFolder) {
      showToast('Bookmark already exists in this folder.', 'error');
      return folder;
    }

    return {
      ...folder,
      bookmarks: [bookmark, ...folder.bookmarks],
    };
  });

  removeBookmarkFromStorage(bookmark.name, bookmark.url);
  saveFoldersToStorage(updatedFolders);

  renderBookmarks(getFilteredBookmarks());
  renderFolders();

  showToast('Bookmark moved to folder.');
}

function removeBookmarkFromFolder(url, folderId) {
  const folders = getFoldersFromStorage();

  const updatedFolders = folders.map(folder => {
    if (folder.id !== folderId) return folder;

    return {
      ...folder,
      bookmarks: folder.bookmarks.filter(bookmark => bookmark.url !== url),
    };
  });

  saveFoldersToStorage(updatedFolders);
  renderFolders();

  showToast('Bookmark removed from folder.');
}

/* ======= import-export ===== */

exportJsonBtn.addEventListener('click', exportBookmarksToJson);
importJsonInput.addEventListener('change', importBookmarksFromJson);
importChromeInput.addEventListener('change', importBookmarksFromChrome);

function exportBookmarksToJson() {
  const bookmarks = getBookmarksFromStorage();
  const folders = getFoldersFromStorage();

  if (!bookmarks.length && !folders.length) {
    showToast('No bookmarks to export.', 'error');
    return;
  }

  const data = {
    version: 2,
    bookmarks,
    folders,
    exportedAt: new Date().toISOString(),
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = 'bookmarks-with-folders.json';
  downloadLink.click();

  URL.revokeObjectURL(url);

  showToast('Bookmarks exported.');
}

function importBookmarksFromJson(event) {
  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const importedData = JSON.parse(e.target.result);

      if (Array.isArray(importedData)) {
        mergeImportedBookmarks(importedData);
        event.target.value = '';
        return;
      }

      if (!importedData || typeof importedData !== 'object') {
        showToast('Invalid JSON format.', 'error');
        return;
      }

      const importedBookmarks = Array.isArray(importedData.bookmarks)
        ? importedData.bookmarks
        : [];

      const importedFolders = Array.isArray(importedData.folders)
        ? importedData.folders
        : [];

      mergeImportedBookmarks(importedBookmarks);
      mergeImportedFolders(importedFolders);

      event.target.value = '';
    } catch (error) {
      showToast('Invalid JSON file.', 'error');
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
        createdAt: new Date().toISOString(),
      })
    );

    if (!importedBookmarks.length) {
      showToast('No bookmarks found in this file.', 'error');
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

  saveBookmarksToStorage(updatedBookmarks);
  renderBookmarks(getFilteredBookmarks());

  showToast(`${uniqueBookmarks.length} bookmarks imported.`);
}

function mergeImportedFolders(importedFolders) {
  const currentFolders = getFoldersFromStorage();

  const normalizedFolders = importedFolders
    .filter(folder => folder.name)
    .map(folder => ({
      id: crypto.randomUUID(),
      name: folder.name,
      isOpen: false,
      createdAt: folder.createdAt || new Date().toISOString(),
      bookmarks: Array.isArray(folder.bookmarks)
        ? folder.bookmarks
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
            }))
        : [],
    }));

  if (!normalizedFolders.length) return;

  saveFoldersToStorage([...normalizedFolders, ...currentFolders]);
  renderFolders();

  showToast(`${normalizedFolders.length} folders imported.`);
}

/* ===== search-bookmark ===== */

bookmarkSearchInput.addEventListener('input', function () {
  renderBookmarks(getFilteredBookmarks());
});

function getFilteredBookmarks() {
  const query = bookmarkSearchInput.value.trim().toLowerCase();

  if (activeFolderId) {
    const folders = getFoldersFromStorage();
    const folder = folders.find(folder => folder.id === activeFolderId);

    if (!folder) return [];

    if (!query) return folder.bookmarks;

    return folder.bookmarks.filter(bookmark => {
      const name = bookmark.name?.toLowerCase() || '';
      const url = bookmark.url?.toLowerCase() || '';

      return name.includes(query) || url.includes(query);
    });
  }

  const bookmarks = getBookmarksFromStorage();
  const folders = getFoldersFromStorage();

  const folderBookmarks = folders.flatMap(folder => folder.bookmarks || []);
  const allBookmarks = [...bookmarks, ...folderBookmarks];

  if (!query) return bookmarks;

  return allBookmarks.filter(bookmark => {
    const name = bookmark.name?.toLowerCase() || '';
    const url = bookmark.url?.toLowerCase() || '';

    return name.includes(query) || url.includes(query);
  });
}

function updateBookmark(oldUrl, newName, newUrl) {
  const bookmarks = getBookmarksFromStorage();

  const updatedBookmarks = bookmarks.map(bookmark => {
    if (bookmark.url === oldUrl) {
      return {
        ...bookmark,
        name: newName,
        url: newUrl,
      };
    }

    return bookmark;
  });

  saveBookmarksToStorage(updatedBookmarks);
}

function updateBookmarkInFolder(folderId, oldUrl, newName, newUrl) {
  const folders = getFoldersFromStorage();

  const updatedFolders = folders.map(folder => {
    if (folder.id !== folderId) return folder;

    return {
      ...folder,
      bookmarks: folder.bookmarks.map(bookmark => {
        if (bookmark.url === oldUrl) {
          return {
            ...bookmark,
            name: newName,
            url: newUrl,
          };
        }

        return bookmark;
      }),
    };
  });

  saveFoldersToStorage(updatedFolders);
}

import"./assets/modulepreload-polyfill-B5Qt9EMX.js";/* empty css                      */const c=document.getElementById("search-input"),$=document.getElementById("search-btn"),i=document.getElementById("meals"),o=document.getElementById("result-heading"),a=document.getElementById("error-container"),d=document.getElementById("meal-details"),v=document.querySelector(".meal-detailes-content"),y=document.getElementById("back-btn"),u="https://www.themealdb.com/api/json/v1/1/",f=`${u}search.php?s=`,p=`${u}lookup.php?i=`;$.addEventListener("click",g);i.addEventListener("click",E);y.addEventListener("click",()=>d.classList.add("hidden"));c.addEventListener("keydown",e=>{e.key==="Enter"&&g()});async function g(){const e=c.value.trim();if(!e){a.textContent="Please enter a search term",a.classList.remove("hidden");return}try{o.textContent=`Searching for "${e}"...`,i.innerHTML="",a.classList.add("hidden");const r=await(await fetch(`${f}${e}`)).json();console.log("data is here:",r),r.meals?(o.textContent=`Search result for "${e}":`,L(r.meals),c.value=""):(o.textContent="",i.innerHTML="",a.textContent=`No recipes found for "${e}". Try another search term!`,a.classList.remove("hidden"))}catch{a.textContent="Something went wrong. Please try again later.",a.classList.remove("hidden")}}function L(e){i.innerHTML="",e.forEach(t=>{i.innerHTML+=`
      <div class="meal" data-meal-id="${t.idMeal}">
        <img src="${t.strMealThumb}" alt="${t.strMeal}">
        <div class="meal-info">
          <h3 class="meal-title">${t.strMeal}</h3>
          ${t.strCategory?`<div class="meal-category">${t.strCategory}</div>`:""}
        </div>
      </div >
      `})}async function E(e){const t=e.target.closest(".meal");if(!t)return;const r=t.getAttribute("data-meal-id");try{const l=await(await fetch(`${p}${r}`)).json();if(console.log(l),l.meals&&l.meals[0]){const s=l.meals[0],h=[];for(let n=1;n<=20;n++)s[`strIngredient${n}`]&&s[`strIngredient${n}`].trim()!==""&&h.push({ingredient:s[`strIngredient${n}`],measure:s[`strMeasure${n}`]});v.innerHTML=`
        <img src="${s.strMealThumb}" alt="${s.strMeal}" class="meal-detailes-img">
        <h2 class="meal-detailes-title">${s.strMeal}</h2>
        <div class="meal-detailes-category">
          <span>${s.strCategory||"Uncategorized"}</span>
        </div>
        <div class="meal-details-instructions">
          <h3>Instructions</h3>
          <p>${s.strInstructions}</p>
        </div>
        <div class="meal-details-ingredients">
          <h3>Ingredients</h3>
          <ul class="ingredients-list">
            ${h.map(n=>`
              <li><i class="fas fa-check-circle"></i> ${n.measure} ${n.ingredient}</li>
            `).join("")}
          </ul>
        </div>
        ${s.strYoutube?`
          <a href="${s.strYoutube}" target="_blank" class="youtube-link">
            <i class="fab fa-youtube"></i> Watch Video
          </a>
        `:""}
      `,d.classList.remove("hidden"),d.scrollIntoView({behavior:"smooth"})}}catch(m){console.error("Error fetching meal details:",m),a.textContent="Failed to load meal details. Please try again.",a.classList.remove("hidden")}}
//# sourceMappingURL=12-recipe-finder.js.map

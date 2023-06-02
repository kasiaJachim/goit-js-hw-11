import Notiflix, { Notify } from 'notiflix';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { fetchImages } from './fetchImages';
import { renderPhoto } from './image-markup.js';

import SimpleLightbox from 'simplelightbox';

const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('[name="searchQuery"]');
const submitBtn = document.querySelector('button');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

searchInput.setAttribute('required', true);
searchForm.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', onLoadMore);

let page = 1;
const per_page = 40;
let images = [];
let searchQuery = null;
let totalPages = 0;

async function onSearch(e) {
  e.preventDefault();
  cleanMarkup();
  searchQuery = e.currentTarget.searchQuery.value.trim();
  lockLoad();
  if (searchForm === '') {
    cleanMarkup();
    lockLoad();
    Notiflix.Notify.warning('Please enter your query');
    return;
  }
  page = 1;

  const response = await fetchImages(searchQuery, page, per_page);
  const totalImages = response.data.totalHits;
  images = response.data.hits;
  totalPages = totalImages / per_page;

  if (images.length > 0) {
    Notify.success(`Hooray! We found ${totalImages} images.`);
    unlockLoad();
  } else {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    lockLoad();
  }
  cleanMarkup();
  render();
}

async function onLoadMore(e) {
  page += 1;
  const response = await fetchImages(searchQuery, page, per_page);
  images = response.data.hits;
  const totalImages = response.data.totalHits;
  totalPages = totalImages / per_page;
  if (totalPages <= page) {
    Notify.info("We're sorry, but you've reached the end of search results.");
    lockLoad();
  }
  render();
}

function render() {
  const items = images;
  const galleryMarkup = items.map(renderPhoto);
  gallery.insertAdjacentHTML('beforeend', galleryMarkup.join(''));
  const lightbox = new SimpleLightbox('.gallery a');
  lightbox.refresh();
}
function cleanMarkup() {
  gallery.innerHTML = '';
}
function lockLoad() {
  loadMoreBtn.classList.add('hidden');
}
function unlockLoad() {
  loadMoreBtn.classList.toggle('hidden', totalPages <= page);
}

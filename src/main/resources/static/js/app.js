document.addEventListener('DOMContentLoaded', function() {
    const resultsPerPage = 5;
    let currentPage = 1;
    let currentResults = [];

    function searchAPI(query) {
        return fetch(`http://localhost:8080/v1/search?query=${encodeURIComponent(query)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao buscar resultados');
                }
                return response.json();
            })
            .then(data => {
                return data; // Assume que os resultados estejam diretamente no objeto JSON retornado
            });
    }

    function renderResults(results) {
        const resultsContainer = document.getElementById('results');
        resultsContainer.innerHTML = '';

        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.classList.add('result-item');

            const resultTitle = document.createElement('h3');
            const titleLink = document.createElement('a');
            titleLink.href = result.url;
            titleLink.textContent = result.title;
            titleLink.target = '_blank'; // Abre o link em uma nova aba
            resultTitle.appendChild(titleLink);

            const resultUrl = document.createElement('p');
            resultUrl.textContent = result.url;

            const resultDescription = document.createElement('p');
            resultDescription.innerHTML = result.abs;

            resultItem.appendChild(resultTitle);
            //resultItem.appendChild(resultUrl);
            resultItem.appendChild(resultDescription);

            resultsContainer.appendChild(resultItem);
        });
    }

    function renderPagination(totalResults) {
        const totalPages = Math.ceil(totalResults / resultsPerPage);
        const paginationContainer = document.getElementById('pagination');
        paginationContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const pageLink = document.createElement('button');
            pageLink.textContent = i;
            pageLink.classList.add('page-link');
            if (i === currentPage) {
                pageLink.classList.add('active');
            }
            pageLink.addEventListener('click', function() {
                currentPage = i;
                displayPageResults();
            });

            paginationContainer.appendChild(pageLink);
        }
    }

    function displayPageResults() {
        const startIndex = (currentPage - 1) * resultsPerPage;
        const endIndex = startIndex + resultsPerPage;
        const pageResults = currentResults.slice(startIndex, endIndex);
        renderResults(pageResults);
    }

    function searchAndUpdateResults() {
        const query = document.getElementById('search-input').value;
        searchAPI(query)
            .then(data => {
                currentResults = data; // Assuma que os resultados estão diretamente no objeto JSON retornado
                currentPage = 1; // Reinicia a página ao fazer uma nova pesquisa
                displayPageResults();
                renderPagination(currentResults.length);
                toggleSearchContainer();
            })
            .catch(error => {
                console.error('Erro ao buscar resultados:', error);
            });
    }

    function toggleSearchContainer() {
        const searchContainer = document.querySelector('.search-container');
        if (currentResults.length > 0) {
            searchContainer.classList.add('compact');
        } else {
            searchContainer.classList.remove('compact');
        }
    }

    document.getElementById('search-form').addEventListener('submit', function(event) {
        event.preventDefault();
        searchAndUpdateResults();
    });

    searchAndUpdateResults();
});

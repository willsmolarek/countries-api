class CountriesApp {
    constructor() {
        this.countries = [];
        this.filteredCountries = [];
        this.apiBaseUrl = 'http://localhost:3000';
        
        // Inicialização segura
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.initializeElements();
        this.initializeEventListeners();
        this.loadCountries();
    }

    initializeElements() {
        this.searchInput = document.getElementById('searchInput');
        this.regionFilter = document.getElementById('regionFilter');
        this.countriesGrid = document.getElementById('countriesGrid');
        this.loadingElement = document.getElementById('loading');
        this.errorElement = document.getElementById('errorMessage');
        
        // Elementos da modal
        this.modal = document.getElementById('countryModal');
        this.modalContent = document.getElementById('modalContent');
        this.closeModal = document.querySelector('.close');
    }

    initializeEventListeners() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => this.filterCountries());
        }
        if (this.regionFilter) {
            this.regionFilter.addEventListener('change', () => this.filterCountries());
        }
        
        // Event listeners para a modal
        if (this.closeModal) {
            this.closeModal.addEventListener('click', () => this.closeModalWindow());
        }
        
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModalWindow();
        });
        
        // Fechar modal com ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModalWindow();
        });
    }

    async loadCountries() {
        try {
            this.showLoading();
            this.hideError();
            
            console.log('Carregando países de:', `${this.apiBaseUrl}/countries`);
            
            const response = await fetch(`${this.apiBaseUrl}/countries`);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            this.countries = await response.json();
            console.log('Países carregados:', this.countries.length);
            
            this.filteredCountries = this.countries;
            this.displayCountries();
            
        } catch (error) {
            const errorMsg = 'Erro ao carregar países. Verifique se a API está rodando em http://localhost:3000';
            this.showError(errorMsg);
            console.error('Erro:', error);
        } finally {
            this.hideLoading();
        }
    }

    filterCountries() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const region = this.regionFilter.value;

        this.filteredCountries = this.countries.filter(country => {
            const matchesSearch = country.name.toLowerCase().includes(searchTerm);
            const matchesRegion = region === '' || country.region === region;
            return matchesSearch && matchesRegion;
        });

        this.displayCountries();
    }

    displayCountries() {
        if (!this.countriesGrid) return;
        
        if (this.filteredCountries.length === 0) {
            this.countriesGrid.innerHTML = '<div class="no-results">Nenhum país encontrado</div>';
            return;
        }

        this.countriesGrid.innerHTML = this.filteredCountries.map(country => `
            <div class="country-card" onclick="app.showCountryDetail(${this.escapeHtml(JSON.stringify(country))})">
                <img src="${country.flag}" alt="Bandeira de ${country.name}" class="country-flag" 
                     onerror="this.src='https://via.placeholder.com/300x200?text=Bandeira+Não+Encontrada'">
                <div class="country-info">
                    <h3 class="country-name">${country.name}</h3>
                    <div class="country-details">
                        <p><strong>Região:</strong> ${country.region}</p>
                        <p><strong>Capital:</strong> ${country.capital || 'N/A'}</p>
                        <p><strong>População:</strong> ${this.formatPopulation(country.population)}</p>
                        <p><strong>Código:</strong> ${country.alpha2Code}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    showCountryDetail(countryJson) {
        try {
            const country = JSON.parse(countryJson);
            this.modalContent.innerHTML = `
                <h2>${this.escapeHtml(country.name)}</h2>
                <img src="${this.escapeHtml(country.flag)}" alt="Bandeira de ${this.escapeHtml(country.name)}" 
                     onerror="this.src='https://via.placeholder.com/300x200?text=Bandeira+Não+Encontrada'">
                
                <div class="modal-details">
                    <div class="modal-detail-item">
                        <strong>🏛️ Capital</strong>
                        <span>${this.escapeHtml(country.capital || 'N/A')}</span>
                    </div>
                    <div class="modal-detail-item">
                        <strong>🌍 Região</strong>
                        <span>${this.escapeHtml(country.region)}</span>
                    </div>
                    <div class="modal-detail-item">
                        <strong>👥 População</strong>
                        <span>${this.formatPopulation(country.population)}</span>
                    </div>
                    <div class="modal-detail-item">
                        <strong>🔠 Código Alpha2</strong>
                        <span>${this.escapeHtml(country.alpha2Code)}</span>
                    </div>
                    <div class="modal-detail-item">
                        <strong>🔡 Código Alpha3</strong>
                        <span>${this.escapeHtml(country.alpha3Code)}</span>
                    </div>
                </div>
            `;
            this.modal.style.display = 'block';
            
            // Focar no botão de fechar para acessibilidade
            setTimeout(() => this.closeModal?.focus(), 100);
            
        } catch (error) {
            console.error('Erro ao mostrar detalhes do país:', error);
            this.showError('Erro ao carregar detalhes do país');
        }
    }

    closeModalWindow() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }

    formatPopulation(population) {
        return new Intl.NumberFormat('pt-BR').format(population);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'block';
        }
        if (this.countriesGrid) {
            this.countriesGrid.innerHTML = '';
        }
    }

    hideLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'none';
        }
    }

    showError(message) {
        if (this.errorElement) {
            this.errorElement.textContent = message;
            this.errorElement.style.display = 'block';
        }
    }

    hideError() {
        if (this.errorElement) {
            this.errorElement.style.display = 'none';
        }
    }
}

// Inicializar a aplicação
try {
    const app = new CountriesApp();
    window.app = app; // Torna a app global para o onclick
    console.log('Aplicação de países inicializada com sucesso!');
} catch (error) {
    console.error('Erro ao inicializar aplicação:', error);
    
    // Fallback básico caso haja erro na inicialização
    if (document.getElementById('errorMessage')) {
        document.getElementById('errorMessage').textContent = 'Erro ao carregar a aplicação.';
        document.getElementById('errorMessage').style.display = 'block';
    }
}
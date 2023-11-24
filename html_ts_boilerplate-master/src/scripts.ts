import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const countryWrapper: HTMLDivElement = document.querySelector('.js-country-wrapper');
const countryHeader: HTMLDivElement = document.querySelector('.js-country-header');

type Country = {
    id?: string;
    name: string;
    code: string;
    capital: string;
    currency: {
        name: string;
    };
    language: {
        name: string;
    };
};

let countryNamesArray: string[] = [];

const getData = async (): Promise<void> => {
  try {
    const response = await axios.get<Country[]>('http://localhost:3004/countries');
    const countries: Country[] = response.data;

    const countriesWithIds = countries.map((country: Country) => ({
      id: uuidv4(),
      ...country,
    }));

    countryNamesArray = Array.from(new Set(countries.map((country: Country) => country.name)));

    if (countryWrapper) {
      countryWrapper.innerHTML = buildTableHTML(countriesWithIds);
    }
  } catch (error) {
    console.error('Error fetching countries:', error);
  }

  const searchButton = document.querySelector<HTMLButtonElement>('.js-search-button');
  const searchCountryName = document.querySelector<HTMLInputElement>('input[name="countryName"]');

  searchButton.addEventListener('click', () => {
    const searchCountryNameValue = searchCountryName.value.trim().toLowerCase();

    console.log('Searching for:', searchCountryNameValue);

    countryNamesArray.forEach((countryName) => {
      console.log('Current country:', countryName);

      const isVisible = countryName.trim().toLowerCase().includes(searchCountryNameValue);

      const countryElement = document.getElementById(`country-${countryName}`);
      if (countryElement) {
        countryElement.closest('tr').classList.toggle('hide', !isVisible);
      }
    });
  });
};

const mainHeader = () => {
  countryHeader.innerHTML = `
    <h2 class="main-header">My Country List</h2>
    <form class="d-flex input-group w-auto js-input" style="gap: 20px; margin: 0 0 10px 0">
        <input class="form-control" type="text" name="countryName" placeholder="Search country name..." value="">
        <input class="form-control" type="text" name="countryCapital" placeholder="Search capital city...">
        <input class="form-control" type="text" name="countryCurrency" placeholder="Search currency...">
        <input class="form-control" type="text" name="countryLanguage" placeholder="Search language...">
        <button type="button" class="search-button js-search-button">Search</button>
        <button type="reset" class="reset-button">Reset</button>
    </form>
    `;
};

getData();
mainHeader();

// Function to build the HTML table
function buildTableHTML(countries: Country[]): string {
  const uniqueCountryNames = Array.from(new Set(countries.map((country) => country.name)));

  let html = `<table class="table table-striped table-dark table-bordered table-hover">
        <thead class="thead-dark">
            <tr>
                <th scope="col">Country name</th>
                <th scope="col">Country code</th>
                <th scope="col">Capital city</th>
                <th scope="col">Currency</th>
                <th scope="col">Language</th>
            </tr>
        </thead>
        <tbody>`;

  uniqueCountryNames.forEach((countryName) => {
    const country = countries.find((c) => c.name === countryName);

    if (country) {
      html += `
                <tr id="country-${country.name}">
                    <td>${country.name}</td>
                    <td>${country.code}</td>
                    <td>${country.capital}</td>
                    <td>${country.currency.name}</td>
                    <td>${country.language.name}</td>
                </tr>`;
    }
  });

  html += '</tbody></table>';
  return html;
}

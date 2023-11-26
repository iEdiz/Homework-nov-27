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
    code: string;
    name: string;
    symbol: string;
  };
  language: {
    code: string;
    name: string;
  };
  flag: string;
  dialling_code: string;
  isoCode: string;
};

let countriesArr: Country[] = [];

const getData = async (): Promise<void> => {
  try {
    const response = await axios.get<Country[]>('http://localhost:3004/countries');
    countriesArr = response.data.map((country) => ({ id: uuidv4(), ...country }));

    if (countryWrapper) {
      countryWrapper.innerHTML = buildTableHTML(countriesArr);
    }
  } catch (error) {
    console.error('Error fetching countries:', error);
  }

  const searchByCountryName = (value: string) => {
    const filteredCountries = countriesArr.filter(
      (country) => country.name.toLowerCase().includes(value.toLowerCase()),
    );
    showCountries(filteredCountries);
  };

  const searchByCapitalCity = (value: string) => {
    const filteredCountries = countriesArr.filter(
      (country) => country.capital.toLowerCase().includes(value.toLowerCase()),
    );
    showCountries(filteredCountries);
  };

  const searchByCurrency = (value: string) => {
    const filteredCountries = countriesArr.filter(
      (country) => country.currency.name.toLowerCase().includes(value.toLowerCase()),
    );
    showCountries(filteredCountries);
  };

  const searchByLanguage = (value: string) => {
    const filteredCountries = countriesArr.filter(
      (country) => country.language.name.toLowerCase().includes(value.toLowerCase()),
    );
    showCountries(filteredCountries);
  };

  const searchCountryName = document.querySelector<HTMLInputElement>('input[name="countryName"]');
  const searchCapitalCity = document.querySelector<HTMLInputElement>('input[name="countryCapital"]');
  const searchCurrency = document.querySelector<HTMLInputElement>('input[name="countryCurrency"]');
  const searchLanguage = document.querySelector<HTMLInputElement>('input[name="countryLanguage"]');

  searchCountryName.addEventListener('input', () => {
    searchByCountryName(searchCountryName.value.trim());
  });

  searchCapitalCity.addEventListener('input', () => {
    searchByCapitalCity(searchCapitalCity.value.trim());
  });

  searchCurrency.addEventListener('input', () => {
    searchByCurrency(searchCurrency.value.trim());
  });

  searchLanguage.addEventListener('input', () => {
    searchByLanguage(searchLanguage.value.trim());
  });
};

const mainHeader = () => {
  countryHeader.innerHTML = `
    <h2 class="main-header">My Country List</h2>
    <form class="d-flex input-group w-auto js-input" style="gap: 20px; margin: 0 0 10px 0">
        <input class="form-control" type="text" name="countryName" placeholder="Search country name..." value="">
        <span class="icon-arrow js-icon-arrow" data-sort="name">&UpArrow;</span>
        <input class="form-control" type="text" name="countryCapital" placeholder="Search capital city...">
        <span class="icon-arrow js-icon-arrow" data-sort="capital">&UpArrow;</span>
        <input class="form-control" type="text" name="countryCurrency" placeholder="Search currency...">
        <input class="form-control" type="text" name="countryLanguage" placeholder="Search language...">
    </form>
    `;
};

const showCountries = (filteredCountries: Country[]) => {
  const countryTable = document.querySelector('.country-table');

  if (countryTable) {
    countryTable.innerHTML = buildTableHTML(filteredCountries);
  }
};

const buildTableHTML = (countries: Country[]): string => {
  const html = `
    <table class="table table-striped table-dark table-bordered table-hover country-table">
      <thead class="thead-dark">
        <tr>
          <th scope="col" class="js-table-heading">Country name</th>
          <th scope="col" class="js-table-heading">Country code</th>
          <th scope="col" class="js-table-heading">Capital city</th>
          <th scope="col" class="js-table-heading">Currency</th>
          <th scope="col" class="js-table-heading">Language</th>
        </tr>
      </thead>
      <tbody>
        ${countries
    .map(
      (country) => `
              <tr class="js-country-row" id="country-${country.id}">
                <td>${country.name}</td>
                <td>${country.code}</td>
                <td>${country.capital}</td>
                <td>${country.currency.name}</td>
                <td>${country.language.name}</td>
              </tr>
            `,
    )
    .join('')}
      </tbody>
    </table>`;

  return html;
};

const sortData = (key: keyof Country) => {
  countriesArr.sort((a, b) => {
    const valueA = a[key].toString().toLowerCase();
    const valueB = b[key].toString().toLowerCase();
    return valueA.localeCompare(valueB);
  });

  showCountries(countriesArr);
};

document.addEventListener('DOMContentLoaded', () => {
  getData();
  mainHeader();

  const arrows = document.querySelectorAll('.js-icon-arrow');

  arrows.forEach((arrow) => {
    arrow.addEventListener('click', () => {
      arrows.forEach((otherArrow) => {
        if (otherArrow !== arrow) {
          otherArrow.classList.remove('down', 'active');
        }
      });

      arrow.classList.toggle('active');
      arrow.classList.toggle('down', arrow.classList.contains('active'));

      const sortBy = arrow.getAttribute('data-sort') as keyof Country | null;

      if (sortBy) {
        sortData(sortBy);
      }
    });
  });
});

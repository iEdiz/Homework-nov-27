import axios from 'axios';
import { event } from 'jquery';
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

const onPageChange = (page: number) => {
  getData(page);
};

const parseLinkHeader = (linkHeader: string | undefined) => {
  const result: Record<string, string> = {};

  if (linkHeader) {
    const links = linkHeader.split(', ');

    links.forEach((link) => {
      const [url, rel] = link.split('; ');
      const [, value] = /<(.+)>/.exec(url) || [];
      result[rel] = value;
    });
  }

  return result;
};

let nextButtonClickHandler: EventListener | null = null;
let prevButtonClickHandler: EventListener | null = null;

const getData = async (page = 1, limit = 20): Promise<void> => {
  try {
    const response = await axios.get<Country[]>('http://localhost:3004/countries', {
      params: {
        _page: page,
        _limit: limit,
      },
    });

    // Access the Link header to get pagination information
    const linkHeader = response.headers.link;
    const paginationInfo = parseLinkHeader(linkHeader);

    const nextButton = document.querySelector<HTMLButtonElement>('.js-next-button');
    const prevButton = document.querySelector<HTMLButtonElement>('.js-prev-button');
    const links = document.querySelectorAll('.link');

    if (nextButton && prevButton) {
      prevButton.disabled = page === 1;
      nextButton.disabled = page === 12;
    }

    const highlightedPage = (pageNumber: number) => {
      links.forEach((link, index) => {
        link.classList.toggle('active-page', index + 1 === pageNumber);
      });
    };

    if (nextButton) {
      // Remove the previous event listener if it exists
      if (nextButtonClickHandler) {
        nextButton.removeEventListener('click', nextButtonClickHandler);
      }

      // Define the click event listener
      nextButtonClickHandler = () => {
        const nextPage = paginationInfo.next
          ? Number(new URL(paginationInfo.next).searchParams.get('_page'))
          : page + 1;

        highlightedPage(nextPage);
        onPageChange(nextPage);
      };

      // Add the new event listener
      nextButton.addEventListener('click', nextButtonClickHandler);
    }

    if (prevButton) {
      if (prevButtonClickHandler) {
        prevButton.removeEventListener('click', prevButtonClickHandler);
      }

      prevButtonClickHandler = () => {
        const prevPage = paginationInfo.prev
          ? Number(new URL(paginationInfo.prev).searchParams.get('_page'))
          : page - 1;

        highlightedPage(prevPage);
        onPageChange(prevPage);
      };

      prevButton.addEventListener('click', prevButtonClickHandler);
    }

    countriesArr = response.data.map((country) => ({ id: uuidv4(), ...country }));

    if (countryWrapper) {
      countryWrapper.innerHTML = buildTableHTML(countriesArr);
    }

    // Use paginationInfo to handle pagination links
    // For example, you can use paginationInfo.next, paginationInfo.prev, etc.
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
    <div class="button-wrapper">
      <div class="button__pagination">
        <button class="button__prev js-prev-button">Prev</button>
        <ul class="button__values">
          <li class="link active-page" value="1">1</li>
          <li class="link" value="2">2</li>
          <li class="link" value="3">3</li>
          <li class="link" value="4">4</li>
          <li class="link" value="5">5</li>
          <li class="link" value="6">6</li>
          <li class="link" value="7">7</li>
          <li class="link" value="8">8</li>
          <li class="link" value="9">9</li>
          <li class="link" value="10">10</li>
          <li class="link" value="11">11</li>
          <li class="link" value="12">12</li>
        </ul>
        <button class="button__next js-next-button">Next</button>
      </div>
    </div>
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

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const countryWrapper: HTMLDivElement = document.querySelector('.js-country-wrapper');
const countryHeader: HTMLDivElement = document.querySelector('.js-country-header');

// Declaring Country type that's in DB
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

// Countries Array that's we will be used for search and sort
let countriesArr: Country[] = [];
const countryLimit = 20;

// Function that takes HTPP link header, parses into JS object, used for pagination
const parseLinkHeader = (linkHeader: string | undefined) => {
  const result: Record<string, string> = {};

  // Check if linkheader is truthy
  if (linkHeader) {
    const links = linkHeader.split(', ');

    // Iterate through each link, then split the URL
    links.forEach((link) => {
      const [url, rel] = link.split('; ');
      const [, value] = /<(.+)>/.exec(url) || []; // With regex extrracts the <...> part of URL, stores into result
      result[rel] = value;
    });
  }

  return result;
};

// Main table of countries function made with Bootstrap
const buildTableHTML = (countries: Country[]): string => {
  const html = `
    <table class="table table-striped table-dark table-bordered table-hover country-table">
      <thead class="thead-dark">
        <tr table__heading>
          <th scope="col" class="js-table-heading">Country name</th>
          <th scope="col" class="js-table-heading">Country code</th>
          <th scope="col" class="js-table-heading">Capital city</th>
          <th scope="col" class="js-table-heading">Currency</th>
          <th scope="col" class="js-table-heading">Language</th>
        </tr>
      </thead>
      <tbody>
        ${countries // Maps countries array to add them to a row in table
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

  return html; // Return final HTML after mapping
};

// eslint-disable-next-line no-undef
let nextButtonClickHandler: EventListener | null = null; // Button for next page
// eslint-disable-next-line no-undef
let prevButtonClickHandler: EventListener | null = null; // Button for previous page

// Function to show filtered countries on search
const showCountries = (filteredCountries: Country[]) => {
  const countryTable = document.querySelector('.country-table');

  if (countryTable) {
    countryTable.innerHTML = buildTableHTML(filteredCountries);
  }
};

// Main function to get data from data base to browser, with default page 1 and data limit 20
const getData = (page = 1, limit = countryLimit): Promise<void> => axios.get<Country[]>('http://localhost:3004/countries', {
  params: {
    _page: page,
    _limit: limit,
  },
}).then((response) => {
  const linkHeader = response.headers.link;
  const paginationInfo = parseLinkHeader(linkHeader);

  const nextButton = document.querySelector<HTMLButtonElement>('.js-next-button');
  const prevButton = document.querySelector<HTMLButtonElement>('.js-prev-button');
  const links = document.querySelectorAll<HTMLTableCellElement>('.link');

  if (nextButton && prevButton) {
    prevButton.disabled = page === 1;
    nextButton.disabled = page === 12;
  }

  const highlightedPage = (pageNumber: number) => {
    links.forEach((link, index) => {
      link.classList.toggle('active-page', index + 1 === pageNumber);
    });
  };
  // Get page number
  const onPageChange = (pageChanged: number) => {
    getData(pageChanged);
  };

  if (nextButton) {
    if (nextButtonClickHandler) {
      nextButton.removeEventListener('click', nextButtonClickHandler);
    }

    nextButtonClickHandler = () => {
      const nextPage = paginationInfo.next
        ? Number(new URL(paginationInfo.next).searchParams.get('_page'))
        : page + 1;

      highlightedPage(nextPage);
      onPageChange(nextPage);
    };

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
}).then(() => {
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
});

// Create HTML for main header search inputs and page numbers
const mainHeader = () => {
  countryHeader.innerHTML = `
    <h2 class="main-header">My Country List</h2>
    <form class="d-flex input-group w-auto js-input" style="gap: 20px; margin: 0 0 10px 0">
        <input class="form-control" type="text" name="countryName" placeholder="Search country name...">
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

// Function that checks Country keys, compares and sorts them
const sortData = (key: keyof Country) => {
  countriesArr.sort((a, b) => {
    const valueA = a[key].toString().toLowerCase();
    const valueB = b[key].toString().toLowerCase();
    return valueA.localeCompare(valueB);
  });

  showCountries(countriesArr); // Asign to filtered countries function
};

// Function that sets eventListener only when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Show all countries
  getData();

  // Show header/inputs/page count
  mainHeader();

  // Adding arrows for sorting
  const arrows = document.querySelectorAll('.js-icon-arrow');

  //
  arrows.forEach((arrow) => {
    arrow.addEventListener('click', () => {
      arrows.forEach((otherArrow) => {
        // Remove down and active class for every arrow except clicked one
        if (otherArrow !== arrow) {
          otherArrow.classList.remove('down', 'active');
        }
      });

      // Toggle the active and down classes for clicked arrow
      arrow.classList.toggle('active');
      arrow.classList.toggle('down', arrow.classList.contains('active'));

      // Get the value of data sort based as key of Country, to sort by Country name or capital
      const sortBy = arrow.getAttribute('data-sort') as keyof Country | null;

      // If the attribute exists then exacture the sortData function
      if (sortBy) {
        sortData(sortBy);
      }
    });
  });
});

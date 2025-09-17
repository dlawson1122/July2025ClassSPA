import { header, nav, main, footer } from "./components";
import * as store from "./store";
import Navigo from "navigo";
import { camelCase } from "lodash";
import axios from "axios";


const router = new Navigo("/");

function render(state = store.home) {
  document.querySelector("#root").innerHTML = `
      ${header(state)}
      ${nav(store.nav)}
      ${main(state)}
      ${footer()}
    `;

  router.updatePageLinks();
}

router.hooks({
  before: (done, params) => {
    const view = params?.data?.view ? camelCase(params.data.view) : "home";

    // Add a switch case statement to handle multiple routes
    switch (view) {
      case "home":
        axios
          .get(
            `https://api.openweathermap.org/data/2.5/weather?appid=${process.env.OPEN_WEATHER_MAP_API_KEY}&units=imperial&q=st%20louis`
          )
          .then(response => {
            store.home.weather = {
              city: response.data.name,
              temp: response.data.main.temp,
              feelsLike: response.data.main.feels_like,
              description: response.data.weather[0].main
            };
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        break;
      // Added in Lesson 7.1
      case "pizza":
        axios
          .get(`${process.env.PIZZA_PLACE_API_URL}/pizzas`)
          .then(response => {
            store.pizza.pizzas = response.data;
            done();
          })
          .catch((error) => {
            console.log("It puked", error);
            done();
          });
        break;
      default:
        done();
    }
  },
  already: (params) => {
    const view = params?.data?.view ? camelCase(params.data.view) : "home";

    render(store[view]);
  },
  after: (params) => {
    const view = params?.data?.view ? camelCase(params.data.view) : "home";

    if (view === "order") {
      // Add an event handler for the submit button on the form
      document.querySelector("form").addEventListener("submit", event => {
        event.preventDefault();

        // Get the form element
        const inputList = event.target.elements;
        console.log("Input Element List", inputList);

        // Create an empty array to hold the toppings
        const toppings = [];

        // Iterate over the toppings array

        for (let input of inputList.toppings) {
          // If the value of the checked attribute is true then add the value to the toppings array
          if (input.checked) {
            toppings.push(input.value);
          }
        }

        // Create a request body object to send to the API
        const requestData = {
          customer: inputList.customer.value,
          crust: inputList.crust.value,
          cheese: inputList.cheese.value,
          sauce: inputList.sauce.value,
          toppings: toppings
        };
        // Log the request body to the console
        console.log("request Body", requestData);

        axios
          // Make a POST request to the API to create a new pizza
          .post(`${process.env.PIZZA_PLACE_API_URL}/pizzas`, requestData)
          .then(response => {
            //  Then push the new pizza onto the Pizza state pizzas attribute, so it can be displayed in the pizza list
            store.pizza.pizzas.push(response.data);
            router.navigate("/pizza");
          })
          // If there is an error log it to the console
          .catch(error => {
            console.log("It puked", error);
          });
      });
    }

    router.updatePageLinks();

    // add menu toggle to bars icon in nav bar
    document.querySelector(".fa-bars").addEventListener("click", () => {
      document.querySelector("nav > ul").classList.toggle("hidden--mobile");
    });
  }
});


router.notFound(() => render(store.viewNotFound));

router.on({
  "/": () => render(),
  // The :view slot will match any single URL segment that appears directly after the domain name and a slash
  '/:view': function (match) {
    console.info("view", match.data.view);
    // If URL is '/about-me':
    // match.data.view will be 'about-me'
    // Using Lodash's camelCase to convert kebab-case to camelCase:
    // 'about-me' becomes 'aboutMe'
    const view = match?.data?.view ? camelCase(match.data.view) : "home";

    // If the store import/object has a key named after the view
    if (view in store) {
      // Then the invoke the render function using the view state, using the view name
      console.info("state", store[view]);
      render(store[view]);
    } else {
      // If the view name is not in the store, then display viewNotFound view
      render(store.viewNotFound);
      console.log(`View ${view} not defined`);
    }
  }
}).resolve();


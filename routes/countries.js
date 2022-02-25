const router = require("express").Router();
const axios = require("axios");
const { authorize } = require("../middlewares/auth");

const refreshAccessToken = async () => {
  const Url = "https://www.universal-tutorial.com/api/getaccesstoken";

  const params = {
    refreshToken:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MWY4ZmY3ZjkzY2JmNzVkMzk0YmRkMjIiLCJpYXQiOjE2NDM3MjgwNTIsImV4cCI6MTY0NDMzMjg1MiwiYXVkIjoiY2xpZW50IiwiaXNzIjoic2VydmVyIn0.HrWsbV9L9ohn2tC1J-BQtS8PVJZaEzYSOvHwdeXsCcE",
  };

  const headers = {
    "api-token":
      "xiFTk4wOt7of7VuS6xIYlUjZGzPpq1cUtc8tUUzFpl0c78nxwU9Y9m8gfWBQlgvC8XU",
    "user-email": "ademuyiwaolutayo@gmail.com",
  };

  const accessToken = await axios.get(Url, {
    params,
    headers,
  });

  return accessToken.data.auth_token;
};

router.get("/", authorize, async (req, res) => {
  let token = await refreshAccessToken();

  if (token) {
    try {
      let allCountries = [];
      const countries = await axios.get(
        `${process.env.COUNTRIES_URL}/countries`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-type": "application/json",
          },
        }
      );

      if (countries) {
        console.log(countries);

        countries.data.map((country) => {
          allCountries.push({
            item: country.country_name,
            id: country.country_short_name,
          });
        });
        res.status(200).json(allCountries);
      }
    } catch (error) {
      console.log(error.message.error);
      res.status(500).send(error.message.error);
    }
  } else {
    console.log("Token not yet ready");
  }
});

router.get("/state/:country", authorize, async (req, res) => {
  let token = await refreshAccessToken();
  if (token) {
    console.log(token);
    try {
      let allStates = [];
      const states = await axios.get(
        `${process.env.COUNTRIES_URL}/states/${req.params.country}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-type": "application/json",
          },
        }
      );

      if (states) {
        states.data.map((currentState) => {
          allStates.push({
            item: currentState.state_name,
            id: currentState.state_name,
          });
        });
      }

      res.status(200).json(allStates);
    } catch (error) {
      console.log(error.message.error);
      res.status(500).send(error.message.error);
    }
  } else {
    console.log("Token not yet ready");
  }
});

router.get("/cities/:state", authorize, async (req, res) => {
  let token = await refreshAccessToken();
  if (token) {
    try {
      let allCities = [];
      const cities = await axios.get(
        `${process.env.COUNTRIES_URL}/cities/${req.params.state}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-type": "application/json",
          },
        }
      );

      if (cities) {
        cities.data.map((city) => {
          allCities.push({
            item: city.city_name,
            id: city.city_name,
          });
        });
      }

      res.status(200).json(allCities);
    } catch (error) {}
  } else {
    console.log("Token not yet ready");
  }
});

module.exports = router;

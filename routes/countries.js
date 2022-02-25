const router = require("express").Router();
const axios = require("axios");
const { authorize } = require("../middlewares/auth");

const refreshAccessToken = async () => {
  const Url = `${process.env.COUNTRIES_URL}/getaccesstoken`;

  const params = {
    refreshToken: process.env.COUNTRIES_REFRESH,
  };

  const headers = {
    "api-token": process.env.COUNTRIES_API_TOKEN,
    "user-email": process.env.COUNTRIES_USER_EMAIL,
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

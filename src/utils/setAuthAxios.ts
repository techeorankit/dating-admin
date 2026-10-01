import axios, { AxiosResponse } from "axios";

// Set Token In Axios (memory JWT with Bearer prefix)
export function setToken(token: string | undefined): void {
  if (token) {
    const value = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    axios.defaults.headers.common["Authorization"] = value;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
}

// Set Key In Axios
export function SetDevKey(key: string | undefined): void {
  if (key) {
    axios.defaults.headers.common["key"] = key;
  } else {
    delete axios.defaults.headers.common["key"];
  }
}

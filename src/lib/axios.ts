"use client";
import Axios from "axios";
import { authClient } from "./auth-client";


export const axios = Axios.create({
  baseURL : process.env.NEXT_PUBLIC_API_URL,
  withCredentials : true,
})




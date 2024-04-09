import axios from "axios";
import { toast } from "react-toastify";
import config from "../config.js";

axios.defaults.headers.common["authorization"] =
  "Bearer " + localStorage.getItem("token");

export const getAllCampaigns = async () => {
  let dataToSend = [],
    err = undefined;
  try {
    const data = await axios.get(config.getAllCampaignsUrl());
    dataToSend = data.data;
  } catch (error) {
    err = error;
  }
  return { data: dataToSend, err: err };
};

export const getCampaignData = async (id) => {
  let dataToSend = {},
    err = undefined;
  try {
    const data = await axios.get(config.getCampaignDataByIdUrl(id));
    dataToSend = data.data;
  } catch (error) {
    err = error;
  }
  return { data: dataToSend, err: err };
};

export const newCampaign = async (data, props) => {
  try {
    const x = await axios.post(config.createNewCampaignUrl(), data);
    props.history.push("/campaign/" + x.data._id);
  } catch (e) {
    if (e.response && e.response.data) {
      toast.error(e.response.data.message);
    } else toast.error("Something went wrong");
  }
};

export const updateCampaign = async (data, props) => {
  try {
    const x = await axios.put(
      config.updateCampaignUrl(props.match.params.id),
      data
    );
    props.history.push("/campaign/" + x.data._id);
  } catch (e) {
    if (e.response && e.response.data) {
      toast.error(e.response.data.message);
    } else toast.error("Something went wrong");
  }
};

export const deleteCampaign = async (props) => {
  try {
    await axios.delete(config.deleteCampaignUrl(props.match.params.id));
    props.history.push("/");
  } catch (e) {
    if (e.response && e.response.data) {
      toast.error(e.response.data.message);
    } else toast.error("Something went wrong");
  }
};


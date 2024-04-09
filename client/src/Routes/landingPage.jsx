import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import NavBar from "../Components/navbar_Landing";
import ImageLanding from "../Components/image_landing";
import OnGoingCampaigns from "../Components/onGoingCampaigns";
import WhyUs from "../Components/whyUsSection";
import NobelCauseComponent from "../Components/nobelCauseComponent";
import ProudToDonate from "../Components/proudToDonateComponent";
import ScrollToTop from "../Components/scrollToTop";
import { getAllCampaigns } from "../services/campaign";
import { compare } from "../utills/math";

const LandingPage = (props) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function getData() {
      const { data, err } = await getAllCampaigns();
      if (err === undefined) {
        setLoading(false);
        data.sort(compare);
        if (data.length > 4) {
          setData(data.slice(0, 4));
        } else {
          setData(data);
        }
      } else {
        if (err.response && err.response.data) {
          toast.error(err.response.data.message);
        } else toast.error("Something went wrong");
      }
    }
    getData();
    return null;
  }, []);
  const handleClick = (p) => {
    let url = "/campaign/" + p;
    props.history.push(url);
  };

  return (
    <React.Fragment>
      <NavBar />
      <ScrollToTop />
      <ImageLanding />
      <WhyUs />
      <OnGoingCampaigns
        handleClick={handleClick}
        data={data}
        loading={loading}
      />
      <NobelCauseComponent />
      <ProudToDonate />
    </React.Fragment>
  );
};

export default LandingPage;

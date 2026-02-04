import React, { useEffect, useState } from "react";
import BrokerDashboardList from "../Broker/BrokerDashboardList";
import { getBrokersDeal } from "../../services/broker";
import { useAccount } from "wagmi";
import NoTransaction from "../../assets/images/NoTransaction.svg";
import Pagination from "../common/Pagination";

function BrokerDashboard({
  updateBrokerData = false,
  setUpdateBrokerData = () => {},
}) {
  const account = useAccount();
  const [brokerList, setBrokerList] = useState([]);
  const [size, setSize] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [totalTokens, setTotalTokens] = useState(0);

  async function getBrokerSpecificDeals(page = 1) {
    try {
      const val = await getBrokersDeal(
        account?.address,
        account?.chainId,
        page
      );
      console.log("Broker", val);
      setBrokerList(val?.data?.data?.links);
      setSize(val?.data?.data?.links?.length);
      setTotalPages(
        Math.floor(val?.data?.data?.totalLinks / 10) +
          (val?.data?.data?.totalLinks % 10 !== 10)
      );
      setTotalTokens(val?.data?.data?.totalLinks);
    } catch (err) {
      console.log("Err", err);
    }
  }

  const goToPage = async (page) => {
    setPage(page);
    await getBrokerSpecificDeals(page);
  };

  const handleNextPage = async () => {
    setPage((prev) => prev + 1);
    await getBrokerSpecificDeals(page + 1);
  };

  const handlePrevPage = async () => {
    setPage((prev) => prev - 1);
    await getBrokerSpecificDeals(page - 1);
  };

  useEffect(() => {
    if (account?.address) {
      getBrokerSpecificDeals();
    } else {
      setBrokerList([]);
    }
  }, [account?.address]);

  useEffect(() => {
    if (updateBrokerData) {
      getBrokerSpecificDeals();
      setUpdateBrokerData(false);
    } else {
      setBrokerList([]);
    }
  }, [updateBrokerData]);

  return (
    <div className="w-full mt-4">
      <div className="flex items-center justify-between mb-[10px] md:mb-4">
        <p className="text-xl font-semibold text-baseWhiteDark dark:text-baseWhite">
          Created Offers As Broker
        </p>
      </div>
      <div className="flex flex-col gap-y-[10px] bg-gray100 dark:bg-gray100Dark border border-gray200 dark:border-gray200Dark px-[10px] py-[10px] md:py-3 md:px-5 rounded-[14px]">
        <div className="items-center hidden w-full grid-cols-7 px-5 text-sm font-medium md:grid text-gray500 dark:text-gray500Dark">
          <p className="col-span-2">Offer</p>
          <p className="">For</p>
          <p className="">Brokerage</p>
          <p className="">Type</p>
          {/* <p className="">Lot</p> */}
          <p className="">Created</p>
          <p className="justify-self-end">Action</p>
        </div>
        <div className="hidden md:flex flex-col gap-y-[10px]">
          {brokerList && brokerList?.length ? (
            brokerList.map((item, index) => {
              return <BrokerDashboardList {...item} key={index} />;
            })
          ) : (
            <div className="flex flex-col items-center justify-center w-full text-base font-medium bg-gray100 dark:bg-gray100Dark py-7 rounded-2xl text-gray500 dark:text-gray500Dark gap-y-4">
              <img src={NoTransaction} alt="no transactions" />
              <p className="w-full px-10 text-center md:w-1/2">
                It seems you have not created any OTC deals. Please Refresh the
                page for update the page
              </p>
            </div>
          )}
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              size={size}
              totalResults={totalTokens}
              totalPages={totalPages}
              goToPage={goToPage}
              handleNextPage={handleNextPage}
              handlePrevPage={handlePrevPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default BrokerDashboard;

import React, { useEffect, useState } from "react";
import OtcGrid from "../OtcGrid";
import OtcList from "../OtcList";
import { getUserActivities, getUserTrades } from "../../services/users";
import { useAccount } from "wagmi";
import NoTransaction from "../../assets/images/NoTransaction.svg";
import Pagination from "../common/Pagination";
import OtcActivityList from "../OtcActivityList";

function OtcDashboard({ updateOtcData = false, setUpdateOtcData = () => {} }) {
  const account = useAccount();
  const [tradeList, setTradeList] = useState([]);
  const [size, setSize] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [totalTokens, setTotalTokens] = useState(0);
  const [tradeListActivities, setTradeListActivities] = useState([]);
  const [sizeActivities, setSizeActivities] = useState(0);
  const [totalPagesActivities, setTotalPagesActivities] = useState(0);
  const [pageActivities, setPageActivities] = useState(1);
  const [totalTokensActivities, setTotalTokensActivities] = useState(0);

  async function getUserSpecificTrade(page = 1) {
    try {
      const val = await getUserTrades(account?.address, account?.chainId, page);
      console.log("Vall", val);
      setTradeList(val?.data?.data?.trades);
      setSize(val?.data?.data?.trades?.length);
      setTotalPages(
        Math.floor(val?.data?.data?.totalTrades / 10) +
          (val?.data?.data?.totalTrades % 10 !== 0)
      );
      setTotalTokens(val?.data?.data?.totalTrades);
    } catch (err) {
      console.log("Err", err);
    }
  }

  async function getUserSpecificActivities(page = 1) {
    try {
      const val = await getUserActivities(
        account?.address,
        account?.chainId,
        page
      );
      console.log("Vall", val);
      setTradeListActivities(val?.data?.data?.activity);
      setSizeActivities(val?.data?.data?.activity?.length);
      setTotalPagesActivities(
        Math.floor(val?.data?.data?.totalActivity / 10) +
          (val?.data?.data?.totalActivity % 10 !== 0)
      );
      setTotalTokensActivities(val?.data?.data?.totalActivity);
    } catch (err) {
      console.log("Err", err);
    }
  }

  const goToPage = async (page, isActivity = false) => {
    if (!isActivity) {
      setPage(page);
      await getUserSpecificTrade(page);
    } else {
      setPageActivities(page);
      await getUserSpecificActivities(page);
    }
  };

  const handleNextPage = async (isActivity = false) => {
    if (!isActivity) {
      setPage((prev) => prev + 1);
      await getUserSpecificTrade(page + 1);
    } else {
      setPageActivities((prev) => prev + 1);
      await getUserSpecificActivities(page + 1);
    }
  };

  const handlePrevPage = async (isActivity = false) => {
    if (!isActivity) {
      setPage((prev) => prev - 1);
      await getUserSpecificTrade(page - 1);
    } else {
      setPageActivities((prev) => prev - 1);
      await getUserSpecificActivities(page - 1);
    }
  };

  useEffect(() => {
    if (account?.address) {
      getUserSpecificTrade();
      getUserSpecificActivities();
    } else {
      setTradeList([]);
      setSize(0);
      setTotalPages(0);
      setTotalTokens(0);
      setTradeListActivities([]);
      setSizeActivities(0);
      setTotalPagesActivities(0);
      setTotalTokensActivities(0);
    }
  }, [account?.address]);

  useEffect(() => {
    if (updateOtcData) {
      getUserSpecificTrade();
      setUpdateOtcData(false);
    } else {
      setTradeList([]);
      setSize(0);
      setTotalPages(0);
      setTotalTokens(0);
    }
  }, [updateOtcData]);

  return (
    <div>
      <div className="w-full mt-4">
        <p className="text-xl font-semibold text-baseWhiteDark dark:text-baseWhite mb-[10px] md:mb-4">
          My Created Offers
        </p>
        <div className="flex flex-col gap-y-[10px] bg-gray100 dark:bg-gray100Dark border border-gray200 dark:border-gray200Dark px-[10px] py-[10px] md:py-3 md:px-5 rounded-[14px]">
          <div className="items-center hidden w-full grid-cols-7 px-5 text-sm font-medium md:grid text-gray500 dark:text-gray500Dark">
            <p className="col-span-2">Offer</p>
            <p className="">For</p>
            <p className="">Views</p>
            <p className="">Progress</p>
            <p className="">Type</p>
            <p className="justify-self-center">Lot</p>
          </div>
          <div className="hidden md:flex flex-col gap-y-[10px]">
            {tradeList && tradeList?.length ? (
              tradeList.map((item, index) => {
                return (
                  <OtcList
                    {...item}
                    key={index}
                    isBuy={item?.trade_type}
                    showBuySell={false}
                  />
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center w-full text-base font-medium bg-gray100 dark:bg-gray100Dark py-7 rounded-2xl text-gray500 dark:text-gray500Dark gap-y-4">
                <img src={NoTransaction} alt="no transactions" />
                <p className="w-full px-10 text-center md:w-1/2">
                  It seems you have not created any OTC deals. Please Refresh
                  the page for update the page
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
          <div className="md:hidden grid grid-cols-1 gap-y-[10px]">
            {tradeList && tradeList?.length ? (
              tradeList.map((item, index) => {
                return (
                  <OtcGrid
                    {...item}
                    key={index}
                    isBuy={item?.trade_type}
                    onButtonClick={() => {}}
                    showBuySell={false}
                  />
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center w-full text-base font-medium bg-gray100 dark:bg-gray100Dark py-7 rounded-2xl text-gray500 dark:text-gray500Dark gap-y-4">
                <img src={NoTransaction} alt="no transactions" />
                <p className="w-full px-10 text-center md:w-1/2">
                  It seems you have not created any OTC deals. Please Refresh
                  the page for update the page
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
      <div className="w-full mt-4">
        <p className="text-xl font-semibold text-baseWhiteDark dark:text-baseWhite mb-[10px] md:mb-4">
          My Contributed Offers
        </p>
        <div className="flex flex-col gap-y-[10px] bg-gray100 dark:bg-gray100Dark border border-gray200 dark:border-gray200Dark px-[10px] py-[10px] md:py-3 md:px-5 rounded-[14px]">
          <div className="items-center hidden w-full grid-cols-6 px-5 text-sm font-medium md:grid text-gray500 dark:text-gray500Dark">
            <p className="col-span-2">Offer</p>
            <p className="">For</p>
            <p className="">Sent</p>
            <p className="">Received</p>
            <p className="justify-self-center">Type</p>
          </div>
          <div className="hidden md:flex flex-col gap-y-[10px]">
            {tradeListActivities && tradeListActivities?.length ? (
              tradeListActivities.map((item, index) => {
                return (
                  <OtcActivityList
                    {...item}
                    key={index}
                    isBuy={item?.trade_type}
                    showBuySell={false}
                  />
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center w-full text-base font-medium bg-gray100 dark:bg-gray100Dark py-7 rounded-2xl text-gray500 dark:text-gray500Dark gap-y-4">
                <img src={NoTransaction} alt="no transactions" />
                <p className="w-full px-10 text-center md:w-1/2">
                  It seems you have not created any OTC deals. Please Refresh
                  the page for update the page
                </p>
              </div>
            )}
            {totalPages > 1 && (
              <Pagination
                currentPage={pageActivities}
                size={sizeActivities}
                totalResults={totalTokensActivities}
                totalPages={totalPagesActivities}
                goToPage={goToPage}
                handleNextPage={handleNextPage}
                handlePrevPage={handlePrevPage}
              />
            )}
          </div>
          <div className="md:hidden grid grid-cols-1 gap-y-[10px]">
            {tradeListActivities && tradeListActivities?.length ? (
              tradeListActivities.map((item, index) => {
                return (
                  <OtcGrid
                    {...item}
                    key={index}
                    isBuy={item?.trade_type}
                    onButtonClick={() => {}}
                    showBuySell={false}
                  />
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center w-full text-base font-medium bg-gray100 dark:bg-gray100Dark py-7 rounded-2xl text-gray500 dark:text-gray500Dark gap-y-4">
                <img src={NoTransaction} alt="no transactions" />
                <p className="w-full px-10 text-center md:w-1/2">
                  It seems you have not created any OTC deals. Please Refresh
                  the page for update the page
                </p>
              </div>
            )}
            {totalPages > 1 && (
              <Pagination
                currentPage={pageActivities}
                size={sizeActivities}
                totalResults={totalTokensActivities}
                totalPages={totalPagesActivities}
                goToPage={(page) => {
                  goToPage(page, true);
                }}
                handleNextPage={() => {
                  handleNextPage(true);
                }}
                handlePrevPage={() => {
                  handlePrevPage(true);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OtcDashboard;

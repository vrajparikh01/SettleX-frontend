import React, { useEffect, useState } from "react";
import Pagination from "../components/common/Pagination";
import { useAccount } from "wagmi";
import NoTransaction from "../assets/images/NoTransaction.svg";
import EquityDealTableView from "../components/Admin/EquityDealTableView.jsx";
import { getEquityTokens } from "../services/admin.js";
import ContactOpenMarketModal from "../components/modal/ContactOpenmarketModal.jsx";

function Equity() {
  const account = useAccount();
  const [size, setSize] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [totalTokens, setTotalTokens] = useState(0);
  const [contactModal, setContactModal] = useState(false);
  const [equityDeals, setEquityDeals] = useState([]);

  async function getEquityDeals(page = 1) {
    try {
      const val = await getEquityTokens(
        account?.chainId,
        page,
        account?.address
      );
      console.log("val", val, val?.data?.data?.equities);
      setEquityDeals(val?.data?.data?.equities);
      setSize(val?.data?.data?.equities?.length);
      setTotalPages(
        Math.floor(val?.data?.data?.totalEquities / 10) +
          (val?.data?.data?.totalEquities % 10 !== 0)
      );
      setTotalTokens(val?.data?.data?.totalEquities);
    } catch (err) {
      console.log("Err", err);
    }
  }

  useEffect(() => {
    if (account?.address) {
      getEquityDeals();
    }
  }, [account?.address]);

  const goToPage = async (page) => {
    setPage(page);
    await getEquityDeals(page);
  };

  const handleNextPage = async () => {
    setPage((prev) => prev + 1);
    await getEquityDeals(page + 1);
  };

  const handlePrevPage = async () => {
    setPage((prev) => prev - 1);
    await getEquityDeals(page - 1);
  };
  return (
    <div className="px-5 py-4 md:px-8">
      <p className="text-xl font-semibold text-baseWhiteDark dark:text-baseWhite">
        Equity Deals
      </p>
      <div className="mt-5 px-[10px] py-[10px] md:px-5 md:py-3 border bg-gray100 dark:bg-gray100Dark border-gray200 dark:border-gray200Dark rounded-[14px]">
        {equityDeals && equityDeals?.length ? (
          <div className="w-full">
            <div className="grid items-center w-full grid-cols-13 font-openmarket-general-sans p-[14px] text-sm font-medium">
              <p className="col-span-3">Project Name</p>
              <p className="col-span-2">Round Type</p>
              <p className="col-span-2">Lot FDV</p>
              <p className="col-span-2">Offer Size</p>
              <p className="col-span-2">Minimum bid</p>
              <p className="col-span-2">Action</p>
            </div>
            <div className="flex flex-col gap-y-2">
              {equityDeals.map((item, index) => {
                return (
                  <EquityDealTableView
                    {...item}
                    isAdmin={false}
                    key={index}
                    handleInvest={() => {
                      setContactModal(true);
                    }}
                  />
                );
              })}
            </div>
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
        ) : (
          <div className="flex flex-col items-center justify-center w-full text-base font-medium bg-gray100 dark:bg-gray100Dark py-7 rounded-2xl text-gray500 dark:text-gray500Dark gap-y-4">
            <img src={NoTransaction} alt="no transactions" />
            <p className="w-full px-10 text-center md:w-1/2">
              It seems There is no equity deals were found. Please Refresh the
              page for update the page
            </p>
          </div>
        )}
      </div>
      {contactModal ? (
        <ContactOpenMarketModal
          closeModal={() => {
            setContactModal(false);
          }}
        />
      ) : (
        <></>
      )}
    </div>
  );
}

export default Equity;

import SideImage from "../assets/images/SideImage.png";
import OpenmarketFullLogo from "../assets/images/OpenmarketFullLogo.svg";
import ConnectWalletButton from "../components/common/ConnectWalletButton";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const account = useAccount();
  const navigate = useNavigate();
  return (
    <div className="flex flex-col-reverse md:flex-row w-screen h-screen">
      <div className="w-full h-1/2 md:h-full bg-brand-gradient p-5 md:p-0 overflow-hidden md:flex-1">
        <div className="bg-open-bg bg-no-repeat bg-cover h-full w-full">
          <div className="p-0 md:p-12 h-full w-full flex flex-col items-start justify-center md:justify-between">
            <img
              src={OpenmarketFullLogo}
              alt="SettleX"
              className="hidden md:block"
            />
            <div className="flex flex-col self-start w-full text-white ">
              <div className="p-5 md:p-10 rounded-3xl bg-baseWhite dark:bg-black flex flex-col gap-y-7 md:gap-y-12 w-full">
                <div className="flex gap-y-4 flex-col justify-start items-start">
                  <p className="font-semibold text-baseWhiteDark dark:text-baseWhite text-2xl md:text-[32px] md:leading-[44px]">
                    {account?.isConnected
                      ? "Wallet Connected"
                      : "Connect Wallet"}
                  </p>
                  <p className="font-medium text-base md:text-lg text-gray500 dark:text-gray500Dark">
                    {account?.isConnected
                      ? "Sign in to view your portfolio."
                      : "Connect your wallet to sign in or create an account"}
                  </p>
                  <div className="flex items-center gap-x-3">
                    <div className="h-5 w-5 min-h-5 min-w-5 rounded-full bg-theme-green"></div>
                    <p className="text-baseWhiteDark dark:text-baseWhite text-base font-semibold break-all">
                      {account?.address}ausgdoiagsiodgaoi
                    </p>
                  </div>
                </div>
                {!account?.isConnected ? (
                  <ConnectWalletButton fullVariant={true} /> // connect wallet
                ) : (
                  <button
                    className={`py-2 px-5 bg-brand-gradient font-semibold whitespace-nowrap text-baseWhiteDark dark:text-baseWhite rounded-full`}
                    type="button"
                    onClick={() => {
                      navigate("/");
                    }}
                  >
                    Sign In
                  </button> //signin
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-center bg-no-repeat bg-cover bg-dot-bg bg-baseWhite dark:bg-black flex flex-col justify-between items-center mt-[60px] md:mt-0 py-9 md:py-16 h-1/2 md:h-full w-full flex-1">
        <div className="block md:hidden fixed w-screen top-0 left-0 bg-baseWhite dark:bg-black py-4 px-5 border-b border-gray400 dark:border-gray400Dark">
          <img src={OpenmarketFullLogo} alt="SettleX" className="w-1/2" />
        </div>
        <img
          src={SideImage}
          alt="SettleX"
          className="object-contain w-full h-full md:h-authMedia"
        />
      </div>
    </div>
  );
};

export default Login;

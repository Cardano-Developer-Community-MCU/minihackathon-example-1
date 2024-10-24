/* eslint-disable react-hooks/exhaustive-deps */

// Dependencies / modules yang digunakan
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { CardanoWallet, useWallet } from "@meshsdk/react";

// Environment variable berisi nama NFT dalam format Hex dan policyID
const token1 = process.env.NEXT_PUBLIC_TOKEN_1;
const token2 = process.env.NEXT_PUBLIC_TOKEN_2;
const token3 = process.env.NEXT_PUBLIC_TOKEN_3;
const policyID = process.env.NEXT_PUBLIC_POLICY_ID;

export default function Login() {
  const router = useRouter();
  const { connected, wallet } = useWallet();
  const [message, setMessage] = useState<null | any>(null);
  const [colorMessage, setColorMessage] = useState<boolean>(true);
  // Jika true kondisi dimana hanya ada satu button login, jika false terdapat pilihan lebih dari satu buttion login
  const [buttonState, setButtonState] = useState<boolean>(true);
  const [assetsList, setAssetsList] = useState([
    { assetName: "", fingerPrint: "", policyId: "", quantity: "", unit: "" },
  ]);

  // Fungsi-fungsi di dalam useEffect akan selalu dieksekusi jika parameter connected terdapat perubahan
  useEffect(() => {
    clearStates();
    // Jika Cardano Wallet berhasil terhubung periksa credential NFT
    if (connected) {
      checkNftCredentials();
    }
  }, [connected]);

  // Fungsi merestart nilai dari parameter-parameter
  function clearStates() {
    setMessage(null);
    setButtonState(true);
    setAssetsList([
      { assetName: "", fingerPrint: "", policyId: "", quantity: "", unit: "" },
    ]);
  }

  // Fungsi untuk memeriksa credential NFT
  async function checkNftCredentials() {
    try {
      // Mendapatkan list token-token (FT / NFT) dari wallet yang terhubung
      const _assets = await wallet.getAssets();
      // console.log("ASSETS:", _assets);

      // Memfilter list token-token NFT yang sesuai dengan nama-nama token dan policyID yang sudah ditentukan di file environtment variable (.env)
      const filteredAsset: any = _assets.filter(
        (asset: { assetName: string; policyId: string }) =>
          (asset.assetName === token1 ||
            asset.assetName === token2 ||
            asset.assetName === token3) &&
          asset.policyId === policyID
      );
      // console.log("FILTERED ASSETS", filteredAsset);

      // Menyimpan list token-token NFT yang sudah di filter
      setAssetsList(filteredAsset);

      // Jika tidak ada / tidak ditemukan token NFT
      if (filteredAsset.length === 0) {
        // Menampilkan notifikasi tidak bisa login karena tidak memiliki NFT
        setMessage("Cannot login, token doesn't exist!");
        setColorMessage(false);
        return;
      }
      // Jika hanya ada satu token NFT
      else if (filteredAsset.length === 1) {
        // Menampilkan notifikasi selamat datang member dan diizinkan untuk bisa login
        const assetName = filteredAsset[0].assetName;
        let membershipType = "";

        // Nama token sesuai membership
        if (assetName === token1) {
          membershipType = "Silver Member";
        } else if (assetName === token2) {
          membershipType = "Gold Member";
        } else if (assetName === token3) {
          membershipType = "Platinum Member";
        }

        const text = `Welcome ${membershipType}`;
        setMessage(text);
        setColorMessage(true);
        setButtonState(true);
      }
      // Jika ada lebih dari satu token NFT
      else {
        // Menampilkan selamat datang dan diizinkan untuk login dengan memilih membership-nya
        setMessage("Welcome, choose your membership");
        setColorMessage(true);
        setButtonState(false);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
      setMessage("Error when connect wallet!");
      setColorMessage(false);
    }
  }

  // Fungsi menangani login
  function loginHandler1() {
    try {
      if (!colorMessage) {
        return;
      } else {
        const memberToken = assetsList[0].assetName;
        if (memberToken === token1) {
          router.push("/membership/silver");
        } else if (memberToken === token2) {
          router.push("/membership/gold");
        } else if (memberToken === token3) {
          router.push("/membership/platinum");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error when login process!");
      setColorMessage(false);
    }
  }

  // Fungsi menangani login
  function loginHandler2(assetName: string) {
    try {
      const memberToken = assetName;
      if (memberToken === token1) {
        router.push("/membership/silver");
      } else if (memberToken === token2) {
        router.push("/membership/gold");
      } else {
        router.push("/membership/platinum");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error when login process!");
      setColorMessage(false);
    }
  }

  // User Interface
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="border border-white rounded-2xl w-96 p-4">
        {/* Judul */}
        <h1 className="text-center font-bold text-3xl mt-4">
          Web3 Login System
        </h1>

        {/* Notifikasi status koneksi wallet */}
        {connected ? (
          <p className="text-center h-10 mt-2 text-green-500">
            Wallet connected
          </p>
        ) : (
          <p className="text-center h-10 mt-2 text-red-500">
            Please connect your wallet
          </p>
        )}

        {/* Notifikasi jika tidak bisa login muncul pesan teks berwarna merah */}
        {colorMessage ? (
          <p className="text-center h-10 text-green-500">{message}</p>
        ) : (
          <p className="text-center h-10 text-red-500">{message}</p>
        )}

        {/* Komponen Cardano Wallet */}
        <div className="flex justify-center item-center mb-8">
          <CardanoWallet />
        </div>

        {buttonState ? (
          // kondisi dimana hanya terdapat satu button login
          <div className="flex justify-center items-center mb-6">
            <button
              type="button"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-xl w-64 h-10"
              onClick={loginHandler1}
            >
              Login
            </button>
          </div>
        ) : (
          // kondisi dimana hanya terdapat lebih dari satu button login
          <div>
            {assetsList.map((asset, index) => (
              <div key={index} className="flex justify-center items-center">
                <button
                  type="button"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-xl w-64 h-10 mb-4"
                  onClick={() => loginHandler2(asset.assetName)}
                >
                  Login as{" "}
                  {asset.assetName === token1
                    ? "Silver Member"
                    : asset.assetName === token2
                    ? "Gold Member"
                    : "Platinum Member"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

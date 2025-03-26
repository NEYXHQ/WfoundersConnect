import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import logo from "../assets/WF_logo-mid.png"; // Add your logo to /assets or update path
import { FiCheck, FiX, FiRefreshCcw, FiUser } from "react-icons/fi"; // Add at the top with other imports

const OracleApproveScreen = () => {
    const wsRef = useRef<WebSocket | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [scannedAddress, setScannedAddress] = useState<string | null>(null);
    const [scannedUser, setScannedUser] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(true);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [isMinting, setIsMinting] = useState(false);
    const [mintCompleted, setMintCompleted] = useState(false);

    const scannerRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        const ws = new WebSocket("wss://wfounders.club/ws/");
        wsRef.current = ws;

        ws.onopen = () => console.log("✅ WebSocket connected");

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("📩 Message from server:", data);
            console.log(`MEssage received with user ${scannedUser}`);

            if (data.event === "user_info") {
                const { name, email, address } = data;
                setStatus(`👤 Name: ${name}`);
                setScannedAddress(address);
                setScannedUser(name);
                setIsScanning(false);
                wsRef.current?.send(JSON.stringify({
                    event: "register_session",
                    address: address, // user's current address
                  }));
            }

            if (data.event === "user_info_not_found") {
                setStatus("❌ User not found");
                setIsScanning(false);
            }

            if (data.event === "approval_success") {
                console.log(`Approval success received with user ${scannedUser}`);
                setIsMinting(false);
                setMintCompleted(true);
                setTxHash(data.txHash);
                setStatus(`✅ NFT Minted`);
            }

            if (data.event === "minting in progress") {
                console.log(`data name = ${data.name}`);
                setScannedUser(data.name);
                console.log(`user after mint progress ${scannedUser}`);
                setIsMinting(true);
                setStatus(`⏳ Minting in progress`);
            }
        };

        scannerRef.current = new Html5Qrcode("reader");

        Html5Qrcode.getCameras().then((devices) => {
            const backCamera = devices.find((d) => d.label.toLowerCase().includes("back"));
            const cameraId = backCamera ? backCamera.id : devices[0].id;

            const readerElement = document.getElementById("reader");
            const width = readerElement?.offsetWidth || 300;
            const qrboxSize = Math.min(250, width - 20);

            scannerRef.current?.start(
                    cameraId,
                    { fps: 10, qrbox: { width: qrboxSize, height: qrboxSize } },
                    (decodedText) => {
                        console.log("✅ Scanned:", decodedText);
                        scannerRef.current?.stop().then(() => scannerRef.current?.clear());

                        const address = decodedText.trim();
                        wsRef.current?.send(JSON.stringify({ event: "get_user_info", address }));
                    },
                    () => { }
                )
                .catch((err) => console.error("❌ QR Scanner start failed:", err));
        });

        return () => {
            scannerRef.current?.stop().then(() => scannerRef.current?.clear());
            console.log(`Closing socket of approver`)
            ws.close();
        };
    }, []);

    const restartScan = () => window.location.reload();

    return (

        <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-start p-6 relative">
            {/* Top Bar */}
            <div className="w-full flex items-center justify-between mb-6 px-4">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <img src={logo} alt="Logo" className="h-10 w-auto" />
                    <h1 className="text-xl font-semibold text-orange-400">Oracle Approval</h1>
                </div>

                {/* Oracle Info */}
                <div className="flex flex-col items-start text-sm text-gray-300 bg-gray-800 px-3 py-2 rounded-lg border border-gray-700 max-w-xs shadow-sm">
                    <div className="flex items-center gap-2">
                        <FiUser className="text-orange-300" />
                        <span className="font-medium">Oracle</span>
                    </div>
                    <span className="truncate text-xs text-orange-200 pl-6">0x34FD...CCB1f</span>
                </div>
            </div>

            {/* QR Scanner */}
            <div id="reader" className="w-full max-w-md rounded-lg overflow-hidden shadow-lg border border-gray-700" />

            {/* Status Message */}
            {status && (
                <div className="mt-4 text-sm text-center text-orange-300 bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
                    {status}
                </div>
            )}

            {/* Action Buttons */}
            {scannedUser && (
                <div className="mt-6 flex flex-col gap-3 w-full max-w-xs">
                    <button
                        onClick={() => {
                            console.log(`minting true with user ${scannedUser}`);
                            setIsMinting(true);
                            console.log(`minting true with user after ${scannedUser}`);
                            setStatus(`Minting in progress for ${scannedUser}`);
                            wsRef.current?.send(JSON.stringify({
                                event: "approve_user",
                                address: scannedAddress,
                            }));
                        }}
                        className={`flex items-center gap-2 text-sm text-white px-4 py-2 rounded-md transition-all
                            ${isMinting ? "bg-green-800 opacity-50 cursor-not-allowed" : "bg-green-800 hover:bg-green-700"}
                            ${mintCompleted ? "hidden" : ""}
                        `}
                        disabled={isMinting}
                        
                    >
                        <FiCheck /> Approve {scannedUser}
                    </button>

                    <button
                        onClick={() => {
                            setStatus("❌ Approval cancelled");
                            setScannedUser(null);
                            setScannedAddress(null);
                        }}
                        className={`flex items-center gap-2 text-sm text-white px-4 py-2 rounded-md transition-all
                            ${isMinting ? "bg-red-800 opacity-50 cursor-not-allowed" : "bg-red-800 hover:bg-red-700"}
                            ${mintCompleted ? "hidden" : ""}
                        `}
                        disabled={isMinting}
                    >
                        <FiX /> Deny
                    </button>

                    <button
                        onClick={() => {
                            setStatus(null);
                            setScannedAddress(null);
                            setScannedUser(null);
                            setTxHash(null);
                            setIsMinting(false);
                            setMintCompleted(false);
                            Html5Qrcode.getCameras().then((devices) => {
                                const backCamera = devices.find((d) => d.label.toLowerCase().includes("back"));
                                const cameraId = backCamera ? backCamera.id : devices[0].id;
                          
                                const readerElement = document.getElementById("reader");
                                const width = readerElement?.offsetWidth || 300;
                                const qrboxSize = Math.min(250, width - 20);
                          
                                scannerRef.current?.start(
                                  cameraId,
                                  { fps: 10, qrbox: { width: qrboxSize, height: qrboxSize } },
                                  (decodedText) => {
                                    console.log("✅ Rescanned:", decodedText);
                                    scannerRef.current?.stop().then(() => scannerRef.current?.clear());
                          
                                    const address = decodedText.trim();
                                    wsRef.current?.send(JSON.stringify({ event: "get_user_info", address }));
                                  },
                                  () => {}
                                );
                              });
                        }}
                        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-sm text-white px-4 py-2 rounded-md transition-all"
                    >
                        <FiRefreshCcw /> Restart Scan
                    </button>

                    {txHash && (
                        <a
                            href={`https://polygonscan.com/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm underline text-blue-300 mt-2"
                        >
                            View Transaction ↗
                        </a>
                    )}
                </div>


            )}
        </div>
    );
};

export default OracleApproveScreen;

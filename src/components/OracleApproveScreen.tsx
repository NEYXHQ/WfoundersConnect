import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const OracleApproveScreen = () => {
    const wsRef = useRef<WebSocket | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [scannedAddress, setScannedAddress] = useState<string | null>(null);
    const [scannedUser, setScannedUser] = useState<string | null>(null);
    useEffect(() => {
        // WebSocket setup
        const ws = new WebSocket("wss://wfounders.club/ws/");
        wsRef.current = ws;

        ws.onopen = () => console.log("✅ WebSocket connected");
        ws.onclose = () => console.log("☑️ WebSocket closed");
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("📩 Message from server:", data);

            if (data.event === "user_info") {
                const { name, email, address } = data;
                setStatus(`👤 Name: ${name}`);
                setScannedAddress(address);
                setScannedUser(name);
            }

            if (data.event === "user_info_not_found") {
                setStatus("❌ User not found");
            }

            if (data.event === "approval_success") {
                setStatus("✅ User approved & NFT minted!");
            }
        };
        ws.onerror = (err) => console.error("❌ WebSocket error:", err);
        ws.onclose = () => console.log("🔌 WebSocket disconnected");

        // Scanner setup
        const html5QrCode = new Html5Qrcode("reader");

        Html5Qrcode.getCameras().then((devices) => {
            const backCamera = devices.find((d) => d.label.toLowerCase().includes("back"));
            const cameraId = backCamera ? backCamera.id : devices[0].id;

            const readerElement = document.getElementById("reader");
            const width = readerElement?.offsetWidth || 300;
            const qrboxSize = Math.min(250, width - 20); // Ensure box fits inside element

            html5QrCode
                .start(
                    cameraId,
                    { fps: 10, qrbox: { width: qrboxSize, height: qrboxSize } },
                    (decodedText) => {
                        console.log("✅ Scanned:", decodedText);
                        html5QrCode.stop().then(() => html5QrCode.clear());

                        const address = decodedText.trim();

                        wsRef.current?.send(
                            JSON.stringify({
                                event: "get_user_info",
                                address,
                            })
                        );

                        // if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                        //   wsRef.current.send(
                        //     JSON.stringify({
                        //       event: "approve_user",
                        //       address,
                        //     })
                        //   );
                        //   setStatus(`✅ Approval sent for: ${address}`);
                        // } else {
                        //   setStatus("⚠️ WebSocket not connected.");
                        // }
                    },
                    (err) => {
                        // Ignore minor scan errors
                    }
                )
                .catch((err) => {
                    console.error("❌ QR Scanner start failed:", err);
                });
        });

        return () => {
            html5QrCode.stop().then(() => html5QrCode.clear());
            ws.close();
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-4 text-white">
            <h1 className="text-xl mb-4">Scan to Approve User</h1>
            <div id="reader" className="w-full max-w-md" style={{ height: "auto" }} />
            {status && <p className="mt-4 text-green-400">{status}</p>}

            {scannedUser && (
                <button
                    className="mt-4 bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
                    onClick={() => {
                        wsRef.current?.send(JSON.stringify({
                            event: "approve_user",
                            address: scannedAddress,
                        }));
                    }}
                >
                    ✅ Approve {scannedUser}
                </button>
            )}
        </div>
    );
};

export default OracleApproveScreen;
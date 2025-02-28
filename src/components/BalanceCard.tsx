const BalanceCard = () => {
    return (
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-4 rounded-lg shadow-md">
        {/* Address */}
        <div className="flex items-center justify-between text-sm text-gray-200">
          <span>0x11123...23423</span>
          <button className="text-gray-300">📋</button>
        </div>
  
        {/* Balance */}
        <div className="text-3xl font-bold mt-2">$325.58 <span className="text-lg">USD</span></div>
  
        {/* Actions */}
        <div className="flex justify-between mt-4">
          <button className="bg-blue-600 px-4 py-2 rounded-lg text-white">⬆ Send</button>
          <button className="bg-blue-600 px-4 py-2 rounded-lg text-white">⬇ Receive</button>
          <button className="bg-blue-600 px-4 py-2 rounded-lg text-white">➕ Buy</button>
        </div>
      </div>
    );
  };
  
  export default BalanceCard;
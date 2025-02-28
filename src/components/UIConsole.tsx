interface ConsoleOutputProps {
    logs: string;
  }
  
  const ConsoleOutput: React.FC<ConsoleOutputProps> = ({ logs }) => {
    return (
      <div id="console" style={{ whiteSpace: "pre-line", marginTop: "20px" }}>
        <p style={{ whiteSpace: "pre-line" }}>{JSON.stringify(logs || {}, null, 2)}</p>
      </div>
    );
  };
  
  export default ConsoleOutput;

  // function uiConsole(...args: any[]): void {
  //   const el = document.querySelector("#console>p");
  //   if (el) {
  //     el.innerHTML = JSON.stringify(args || {}, null, 2);
  //     console.log(...args);
  //   }
  // }
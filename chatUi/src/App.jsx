// import React from "react";
// import ChatApp from "./ChatApp";

// const styles = {
//   app: {
//     display: "flex",
//     flexDirection: "column",
//     minHeight: "100vh",
//     fontFamily: "Arial, sans-serif",
//   },
//   header: {
//     backgroundColor: "#007BFF",
//     color: "white",
//     textAlign: "center",
//     padding: "16px",
//     fontSize: "20px",
//     fontWeight: "bold",
//   },
//   footer: {
//     textAlign: "center",
//     padding: "12px",
//     fontSize: "14px",
//     color: "gray",
//     borderTop: "1px solid #ddd",
//     backgroundColor: "#f9f9f9",
//     marginTop: "auto", // pushes footer to bottom
//   },
// };

// function App() {
//   return (
//     <div style={styles.app}>
//       <header style={styles.header}>Omio Mini Travel Assistant</header>
//       <ChatApp />
//       <footer style={styles.footer}>
//         © 2025 Omio Mini. All rights reserved.
//       </footer>
//     </div>
//   );
// }

// export default App;

import React from "react";
import ChatApp from "./ChatApp";
import travelLogo from "/travel-logo.png"; // make sure this path is correct

const styles = {
  app: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f4f4f4",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007BFF",
    color: "white",
    padding: "16px",
    fontSize: "22px",
    fontWeight: "bold",
    gap: "12px",
  },
  headerLogo: {
    height: "36px",
    width: "36px",
    objectFit: "contain",
  },
  footer: {
    textAlign: "center",
    padding: "12px",
    fontSize: "14px",
    color: "gray",
    borderTop: "1px solid #ddd",
    backgroundColor: "#f9f9f9",
    marginTop: "auto",
  },
};

function App() {
  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <img src={travelLogo} alt="Travel Logo" style={styles.headerLogo} />
        Omio Mini Travel Assistant
      </header>
      <ChatApp />
      <footer style={styles.footer}>© 2025 Omio Mini. All rights reserved.</footer>
    </div>
  );
}

export default App;




import React, { useState } from "react";

function SubmitPhrase({ musicPhrase, onSubmit, isLoading, isError }) {
  const [submitPhrase, setSubmitPhrase] = useState("some music text");

  const [apiEndPoint, setApiEndPoint] = useState(
    "http://127.0.0.1:8000/music/send_phrase"
  );

  console.log("Submitted phrase: " + musicPhrase);
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Make sure musicPhrase exists before submitting
    if (!musicPhrase) {
      console.error("Music phrase is empty");
      onSubmit(null, false, true); // Pass error state
      return;
    }

    // Update state for future use
    //setSubmitPhrase(phraseToSubmit);

    const data = {
      submit_phrase: musicPhrase,
      submit_time: new Date().toISOString(),
    };

    try {
      console.log(JSON.stringify(data));
      onSubmit(null, true, false); // Pass loading state and no error
      const response = await fetch(apiEndPoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      onSubmit(result, false, false); // Pass the result and stop loading
    } catch (error) {
      console.error("Error submitting phrase:", error);
      onSubmit(null, false, false); // Stop progress on error
    }
  };

  //   return (
  //     <form onSubmit={handleSubmit}>
  //       <button className="submit-button" type="submit">
  //         <img src="./src/assets/submit-button.png" alt="Submit" />
  //       </button>
  //     </form>
  //   );

  return (
    <>
      <div>
        <form onSubmit={handleSubmit}>
          <button className="submit-button" type="submit" disabled={isLoading}>
            {isLoading ? (
              <div className="loader"></div> // Show loading spinner when loading
            ) : (
              <img src="./src/assets/submit-button.png" alt="Submit" />
            )}
          </button>
        </form>
      </div>
    </>
  );
}

export default SubmitPhrase;

import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <div className="footer">
        &copy; {currentYear}; Developed by <b>Gurunaidu Pinniti</b>
      </div>
    </>
  );
}
export default Footer;

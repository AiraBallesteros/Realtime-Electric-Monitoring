import { PropTypes } from "prop-types";
import { Badge } from "./ui/badge";

Header.propTypes = {
  title: PropTypes.string,
  userType: PropTypes.string,
};

function Header({ title, userType = "Admin" }) {
  return (
    <div className="flex w-full items-center justify-between">
      <h2 className="font-bold">{title}</h2>
      <Badge>{userType}</Badge>
    </div>
  );
}

export default Header;

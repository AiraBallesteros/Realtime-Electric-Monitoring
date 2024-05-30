import { AvatarImage } from "@radix-ui/react-avatar";
import { PropTypes } from "prop-types";
import { Avatar } from "./ui/avatar";
import { Card } from "./ui/card";

Member.propTypes = {
  image: PropTypes.string,
  name: PropTypes.string,
  position: PropTypes.string,
  details: PropTypes.string,
};

function Member({ image, name, position, details }) {
  return (
    <Card className="w-full p-8 space-y-4">
      <div className="flex items-center gap-1">
        <Avatar>
          <AvatarImage src={image} />
        </Avatar>
        <div>
          <h4 className="mb-0 p-0">{name}</h4>
          <p className="text-muted-foreground -mt-2">{position}</p>
        </div>
      </div>
      <div>
        <p>{details}</p>
      </div>
    </Card>
  );
}

export default Member;

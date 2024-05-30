import Member from "./member";


function AboutUs() {
  return (
    <div className="space-y-4">
      <div className="w-full">
        <h4 className="mb-0 p-0">About Us</h4>
        <p className="text-muted-foreground">
          About the project team and the purpose of the project.
        </p>
      </div>
      <div className="grid lg:grid-cols-4 xl:grid-cols-5 md:grid-cols-2 sm:grid-cols-1 gap-2">
        <Member
          name={"Carl Agna"}
          position={"Developer"}
          details={"4 - BS Computer Engineering"}
          ///image="src\assets\images\about_carl.jpg"
          image="https://lh3.googleusercontent.com/a-/ALV-UjVWFv0z_0KohTUNTTDTB62w1dTtkBHwmzP8R2Pr8Jy1M_Xjpd2j=s32-c"
        />
        <Member
          name={"Aira Ballesteros"}
          position={"Developer"}
          details={"4 - BS Computer Engineering"}
          //image="src\assets\images\about_aira.jpg"
          image="https://lh3.googleusercontent.com/a/ACg8ocIbrYc9HUbtTrGww7ORV-pnOGk6BOpD8sr6t3vCqKH3Q9e1PBZ-=s96-c-rg-br100"
        />
        <Member
          name={"Xavier Nieva"}
          position={"Developer"}
          details={"4 - BS Computer Engineering"}
          //image="src\assets\images\about_xavier.jpg"
          image="https://scontent.fwnp1-1.fna.fbcdn.net/v/t1.6435-9/83824559_2506942302899833_1595770046284562432_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=5f2048&_nc_ohc=xoHpCbN9ZB8Q7kNvgFhv3Mr&_nc_ht=scontent.fwnp1-1.fna&oh=00_AfAvidFtWZaZ2lzrmlH1jPFqkbxboDgmzwc63qHgAbeEAQ&oe=665A030F"
        />
        <Member
          name={"Elmer Claveria Jr."}
          position={"Thesis Advisor"}
          details={"Faculty - Ateneo de Naga University"}
          //image="src\assets\images\about_elmer.jpg"
          image="https://scontent.fwnp1-1.fna.fbcdn.net/v/t39.30808-6/358476077_2199025767154444_2998379665895390615_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=5f2048&_nc_ohc=hhWlLVzZ6xsQ7kNvgEBP41C&_nc_ht=scontent.fwnp1-1.fna&oh=00_AYDsEqpWA5cC8AfAX9VcVTBHFW9b3Gf0-8IBk0_EYEUdrw&oe=6649344B"
        />
        <Member
          name={"Packetworx"}
          position={"Device Lender"}
          details={"Provided us the packetSENSE AC Energy Meter"}
          //image="src\assets\images\about_packetworx.jpg"
          image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_eEaj32JYw1cMP6vHrVRSIO9ZjLg0DhB5RvfoTLN9eg&s"
        />
      </div>
    </div>
  );
}

export default AboutUs;

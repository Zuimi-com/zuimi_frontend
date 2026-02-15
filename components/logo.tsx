import Image from "next/image";
import React from "react";

const Logo = () => {
  return (
    <div className="flex items-center">
      <Image
        src="/zuimi-logo.svg"
        alt="Zuimi logo"
        width={160}
        height={60}
        className="object-contain"
      />
    </div>
  );
};

export default Logo;

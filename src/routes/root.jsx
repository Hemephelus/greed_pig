import { Outlet } from "react-router-dom";

function Root() {
  return (
    <>
      <main className="bg-[#111111] min-h-screen min-w-full relative z-10 sec-font ">
        <div className=" rounded-full bg-[#056FA4] blur-[845px] w-[800px] h-[800px] -z-10 fixed -bottom-96 -left-96"></div>
        <div className=" rounded-full bg-[#D30CBD] blur-[845px] w-[800px] h-[800px] -z-10 fixed -top-96 -right-96"></div>
        <Outlet />
      </main>
    </>
  );
}

export default Root;

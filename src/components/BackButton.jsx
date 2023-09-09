import { useNavigate } from "react-router-dom";
import {BiArrowBack} from 'react-icons/bi'
export default function BackButton() {
  const navigate = useNavigate();
  return <button onClick={() => navigate(-1)} className="bg-[#ffffff10] hover:bg-[#ffffff40] duration-300 text-white w-[48px] h-[48px] border rounded-full flex justify-center items-center"><BiArrowBack size={24} /></button>;
}

import updateIcon from "@assets/iconSVG_2/updateIcon.svg";
import deleteIcon from "@assets/deleteIcon.svg";

const BonoCard = ({ bono, onEdit, onDelete }) => {
  return (
    <div className="flex flex-col items-center bg-[#F3E8EE] border border-[#729B79] rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow max-w-sm dark:bg-[#2e2c2f]">
      <h2 className="text-lg font-bold text-[#475B63] mb-2 text-center dark:text-[#F3E8EE]">
        {bono.nombreBono}
      </h2>
      <div>

        <button 
          onClick={() => onEdit(bono)}
          className="group p-3 white rounded-md hover:bg-[#bacdb0] transition"
        >
          <img  
            src={updateIcon} 
            alt="Editar" 
            className="w-4 h-4 fill-white group-hover:invert group-hover:brightness-0 group-hover:saturate-100 group-hover:contrast-1000"
          />
        </button>
        <button 
          onClick={() => onDelete(bono.id)}
          className="group p-3 white rounded-md hover:bg-red-600 transition"
        >
          <img 
            src={deleteIcon} 
            alt="Eliminar" 
            className="w-4 h-4 group-hover:invert group-hover:brightness-0 group-hover:saturate-100 group-hover:contrast-1000"
          />
        </button>

      </div>
      
    </div>
  );
};

export default BonoCard;
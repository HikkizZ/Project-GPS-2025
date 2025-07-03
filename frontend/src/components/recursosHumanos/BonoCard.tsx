import updateIcon from "../../assets/iconSVG_2/updateIcon.svg";
import deleteIcon from "../../assets/deleteIcon.svg";

const BonoCard = ({ bono, onEdit, onDelete }) => {
  return (
    <div className="d-flex flex-column align-items-center border rounded shadow p-4"
    style={{
      backgroundColor: "#BDE3EC", // fondo claro
      borderColor: "#729B79",     // borde personalizado
      maxWidth: "24rem",          // similar a max-w-sm (~384px)
      transition: "box-shadow 0.3s ease-in-out"
    }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0.5rem 1rem rgba(0,0,0,0.2)"}
    onMouseLeave={e => e.currentTarget.style.boxShadow = "0 .5rem 1rem rgba(0,0,0,0.15)"}
  >
      <h2 
        className="h5 fw-bold text-center mb-2"
        style={{ color: "#1A5E63" }}
      >
        {bono.nombreBono}
      </h2>
      <div className="d-flex flex-row h-100">

        <button 
          onClick={() => onEdit(bono)}
          className="btn btn-outline-secondary p-2"
        >
          <img  
            src={updateIcon} 
            alt="Editar" 
            style={{
              width: "20px",
              height: "20px",
              objectFit: "contain",
              display: "block"
            }}
          />
        </button>
        <button 
          onClick={() => onDelete(bono.id)}
          className="btn btn-outline-secondary p-2"
        >
          <img 
            src={deleteIcon} 
            alt="Eliminar" 
            style={{
              width: "20px",
              height: "20px",
              objectFit: "contain",
              display: "block"
            }}
          />
        </button>

      </div>
      
    </div>
  );
};

export default BonoCard;
const CustomButton = ({text, onClick}) => {
  return (
    <button
      onClick={onClick}
      className="bg-gradient-to-b from-primary to-darkColor text-textColor border-2 border-secundary p-4 rounded-2xl uppercase font-bold hover:bg-gradient-to-b hover:from-textColor hover:to-primary hover:text-secundary w-72 justify-center"
    >
      {text}
    </button>
  );
}

export default CustomButton
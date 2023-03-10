type TagProps = {
  id: string;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
};

export const Tag = ({ id, className, onClick, children }: TagProps) => {
  const baseClassName = "text-xs px-2 py-1 bg-blue-300 rounded";
  return (
    <div onClick={onClick} id={id} className={`${baseClassName} ${className}`}>
      {children}
    </div>
  );
};

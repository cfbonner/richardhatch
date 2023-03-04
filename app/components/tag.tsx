type TagProps = {
  id: string;
  className?: string;
  children: React.ReactNode;
};

export const Tag = ({ id, className, children }: TagProps) => {
  const baseClassName = "text-xs px-2 py-1 bg-blue-300 rounded";
  return (
    <div id={id} className={`${baseClassName} ${className}`}>
      {children}
    </div>
  );
};

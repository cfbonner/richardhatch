type TagListProps = {
  className?: string;
  children: React.ReactNode;
};

export const TagList = ({ className, children }: TagListProps) => {
  const baseClassName = "flex flex-wrap gap-1 mb-1";
  return <ul className={`${baseClassName} ${className}`}>{children}</ul>;
};

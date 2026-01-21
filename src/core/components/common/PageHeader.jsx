export function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">{title}</h1>
        {description && (
          <p className="text-sm sm:text-base text-muted-foreground mt-1 line-clamp-2">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
}


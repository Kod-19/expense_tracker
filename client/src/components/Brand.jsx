const Brand = ({ greeting = false, className = '' }) => {
  const Wrapper = greeting ? 'p' : 'div'

  return (
    <Wrapper className={`flex items-center gap-2.5 ${className}`}>
      <img src="/watchmoni.svg" alt="" aria-hidden="true" className="h-9 w-9 shrink-0" />
      <span className={greeting ? 'text-lg font-semibold text-muted sm:text-xl' : 'text-xl font-bold tracking-tight text-text'}>
        {greeting ? (
          <>
            Welcome to <span className="font-bold text-primary">WatchMoni</span>
          </>
        ) : (
          'WatchMoni'
        )}
      </span>
    </Wrapper>
  )
}

export default Brand

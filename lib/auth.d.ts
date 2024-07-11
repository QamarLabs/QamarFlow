type TEntry = typeof import('../app/api/auth/[...nextauth]/route')

// Check that the entry is a valid entry
checkFields<Diff<{
  GET?: Function
  HEAD?: Function
  OPTIONS?: Function
  POST?: Function
  PUT?: Function
  DELETE?: Function
  PATCH?: Function
  config?: {}
  generateStaticParams?: Function
  revalidate?: RevalidateRange<TEntry> | false
  dynamic?: 'auto' | 'force-dynamic' | 'error' | 'force-static'
  dynamicParams?: boolean
  fetchCache?: 'auto' | 'force-no-store' | 'only-no-store' | 'default-no-store' | 'default-cache' | 'only-cache' | 'force-cache'
  preferredRegion?: 'auto' | 'global' | 'home' | string | string[]
  runtime?: 'nodejs' | 'experimental-edge' | 'edge'
  maxDuration?: number
  
}, TEntry, ''>>()
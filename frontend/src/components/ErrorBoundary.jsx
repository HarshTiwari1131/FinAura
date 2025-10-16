import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('Profile ErrorBoundary caught:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8">
          <div className="rounded-xl border card-base p-6">
            <div className="text-red-400 font-medium">Something went wrong while rendering.</div>
            <div className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>{String(this.state.error)}</div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

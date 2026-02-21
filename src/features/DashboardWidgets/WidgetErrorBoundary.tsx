'use client';

import { Flexbox } from '@lobehub/ui';
import { Button, Typography } from 'antd';
import { AlertTriangle } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  widgetName: string;
}

interface State {
  error: Error | null;
  hasError: boolean;
}

class WidgetErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null, hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error, hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[Widget "${this.props.widgetName}"] Error:`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ error: null, hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Flexbox align="center" gap={8} justify="center" style={{ height: '100%', padding: 16 }}>
          <AlertTriangle size={24} style={{ opacity: 0.45 }} />
          <Typography.Text style={{ opacity: 0.65 }} type="secondary">
            {this.props.widgetName} failed to render
          </Typography.Text>
          <Button onClick={this.handleRetry} size="small" type="link">
            Retry
          </Button>
        </Flexbox>
      );
    }

    return this.props.children;
  }
}

export default WidgetErrorBoundary;

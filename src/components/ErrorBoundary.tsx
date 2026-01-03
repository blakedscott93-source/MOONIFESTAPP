/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the app
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../utils/theme';
import { captureError, isSentryEnabled } from '../utils/sentry';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Store error info for display
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send error to Sentry if configured
    if (isSentryEnabled()) {
      captureError(error, {
        errorBoundary: {
          componentStack: errorInfo.componentStack,
        },
      });
    } else {
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <View style={styles.container}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="alert-circle" size={64} color={Theme.colors.error} />
            </View>

            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.message}>
              We're sorry, but something unexpected happened. Don't worry, your data is safe.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Error Details (Development Only):</Text>
                <Text style={styles.errorText}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text style={styles.errorStack}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}

            <TouchableOpacity
              style={styles.resetButton}
              onPress={this.handleReset}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={20} color={Theme.colors.textInverse} />
              <Text style={styles.resetButtonText}>Try Again</Text>
            </TouchableOpacity>

            <Text style={styles.hint}>
              If this problem persists, please restart the app or contact support.
            </Text>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.bg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  iconContainer: {
    marginBottom: Theme.spacing.xl,
  },
  title: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  },
  message: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    lineHeight: 24,
  },
  errorDetails: {
    width: '100%',
    backgroundColor: Theme.colors.surfaceSecondary,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
    maxHeight: 300,
  },
  errorTitle: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.error,
    marginBottom: Theme.spacing.sm,
  },
  errorText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    fontFamily: 'monospace',
    marginBottom: Theme.spacing.md,
  },
  errorStack: {
    ...Theme.typography.caption,
    color: Theme.colors.textTertiary,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.accent,
    borderRadius: Theme.radius.lg,
    paddingVertical: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.xxl,
    gap: Theme.spacing.sm,
    ...Theme.shadow.medium,
    marginBottom: Theme.spacing.md,
  },
  resetButtonText: {
    ...Theme.typography.h3,
    color: Theme.colors.textInverse,
    fontWeight: '700',
  },
  hint: {
    ...Theme.typography.caption,
    color: Theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: Theme.spacing.md,
  },
});

// HOC for wrapping components with ErrorBoundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}




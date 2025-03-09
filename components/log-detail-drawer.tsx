'use client';

import { useEffect, useState } from 'react';
import { X, Clock, Globe, Server, FileJson, ArrowRight, User, Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import Editor from '@monaco-editor/react';

export function LogDetailDrawer() {
  const [open, setOpen] = useState(false);
  const [logData, setLogData] = useState<any>(null);

  useEffect(() => {
    const handleViewLogDetails = (event: CustomEvent) => {
      setLogData(event.detail);
      setOpen(true);
    };

    window.addEventListener('view-log-details', handleViewLogDetails as EventListener);

    return () => {
      window.removeEventListener('view-log-details', handleViewLogDetails as EventListener);
    };
  }, []);

  if (!logData) return null;

  const formatTime = (time: number) => {
    if (time < 1000) return `${time.toFixed(2)} ns`;
    if (time < 1000000) return `${(time / 1000).toFixed(2)} μs`;
    return `${(time / 1000000).toFixed(2)} ms`;
  };

  const formatJson = (json: any) => {
    try {
      return JSON.stringify(json, null, 2);
    } catch (e) {
      return 'Unable to parse JSON';
    }
  };

  const getStatusColor = (statusCode: number) => {
    if (statusCode < 300) return 'success';
    if (statusCode < 400) return 'warning';
    return 'destructive';
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'default';
      case 'POST':
        return 'secondary';
      case 'PUT':
        return 'outline';
      case 'DELETE':
        return 'destructive';
      default:
        return 'default';
    }
  };
  const isGraphQLLog = 'query' in logData;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isGraphQLLog ? (
                <>
                  <Badge variant="outline">{logData.operationName || 'Unnamed'}</Badge>
                  <DrawerTitle className="font-mono text-base">GraphQL Query</DrawerTitle>
                </>
              ) : (
                <>
                  <Badge variant={getMethodColor(logData.request.method)}>{logData.request.method}</Badge>
                  <DrawerTitle className="font-mono text-base">{logData.request.url.path}</DrawerTitle>
                </>
              )}
            </div>
            {!isGraphQLLog && (
              <Badge variant={getStatusColor(logData.response.status_code)}>{logData.response.status_code}</Badge>
            )}
          </div>
          <DrawerDescription className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{new Date(logData.timestamp).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Server className="h-4 w-4" />
              <span>{logData.hostname}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatTime(isGraphQLLog ? logData.duration : logData.response.time)}</span>
            </div>
          </DrawerDescription>
        </DrawerHeader>

        <Tabs defaultValue="overview" className="p-4">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="request">Request</TabsTrigger>
            <TabsTrigger value="response">Response</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[50vh]">
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Client Information
                  </h3>
                  <div className="rounded-md border p-4 space-y-2">
                    {isGraphQLLog ? (
                      <>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-sm font-medium">User ID:</span>
                          <span className="text-sm col-span-2 font-mono">{logData.userId || 'N/A'}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-sm font-medium">User Agent:</span>
                          <span className="text-sm col-span-2 break-all">{logData.userAgent || 'Not provided'}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-sm font-medium">IP Address:</span>
                          <span className="text-sm col-span-2 font-mono">{logData.request.ip}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-sm font-medium">User Agent:</span>
                          <span className="text-sm col-span-2 break-all">
                            {logData.request.headers['user-agent'] || 'Not provided'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Request Summary
                  </h3>
                  <div className="rounded-md border p-4 space-y-2">
                    {isGraphQLLog ? (
                      <>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-sm font-medium">Operation:</span>
                          <Badge variant="outline" className="col-span-2 w-fit">
                            {logData.operationName || 'Unnamed'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-sm font-medium">Duration:</span>
                          <span className="text-sm col-span-2">{formatTime(logData.duration)}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-sm font-medium">Method:</span>
                          <Badge variant={getMethodColor(logData.request.method)} className="col-span-2 w-fit">
                            {logData.request.method}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-sm font-medium">Path:</span>
                          <span className="text-sm col-span-2 font-mono break-all">{logData.request.url.path}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-sm font-medium">Status:</span>
                          <Badge variant={getStatusColor(logData.response.status_code)} className="col-span-2 w-fit">
                            {logData.response.status_code}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-sm font-medium">Response Time:</span>
                          <span className="text-sm col-span-2">{formatTime(logData.response.time)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {isGraphQLLog ? (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    Query
                  </h3>
                  <div className="rounded-md border p-4">
                    <Editor
                      height="400px"
                      language="graphql"
                      value={logData.query}
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    Response Message
                  </h3>
                  <div className="rounded-md border p-4">
                    <p className="text-sm font-mono">{logData.response.message}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Request ID
                </h3>
                <div className="rounded-md border p-4">
                  <p className="text-sm font-mono break-all">{logData.requestID || logData.request.requestID}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="request" className="space-y-4">
              {isGraphQLLog ? (
                <>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Variables</h3>
                    <div className="rounded-md border p-4">
                      {logData.variables ? (
                        <pre className="text-sm font-mono whitespace-pre-wrap">{formatJson(logData.variables)}</pre>
                      ) : (
                        <p className="text-sm text-muted-foreground">No variables provided</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Query</h3>
                    <div className="rounded-md border p-4">
                      <Editor
                        height="400px"
                        language="graphql"
                        value={logData.query}
                        options={{
                          readOnly: true,
                          minimap: { enabled: false },
                        }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Headers</h3>
                    <div className="rounded-md border p-4">
                      {Object.keys(logData.request.headers || {}).length > 0 ? (
                        <pre className="text-sm font-mono whitespace-pre-wrap">{formatJson(logData.request.headers)}</pre>
                      ) : (
                        <p className="text-sm text-muted-foreground">No headers provided</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Query Parameters</h3>
                    <div className="rounded-md border p-4">
                      {logData.request.url.queryString ? (
                        <pre className="text-sm font-mono whitespace-pre-wrap">{logData.request.url.queryString}</pre>
                      ) : (
                        <p className="text-sm text-muted-foreground">No query parameters</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Request Body</h3>
                    <div className="rounded-md border p-4">
                      {logData.request.body ? (
                        <pre className="text-sm font-mono whitespace-pre-wrap">{formatJson(logData.request.body)}</pre>
                      ) : (
                        <p className="text-sm text-muted-foreground">No request body</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="response" className="space-y-4">
              {isGraphQLLog ? (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Response Data</h3>
                  <div className="rounded-md border p-4">
                    <Editor
                      height="400px"
                      language="json"
                      value={formatJson(logData.response)}
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                      }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Status</h3>
                    <div className="rounded-md border p-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(logData.response.status_code)}>{logData.response.status_code}</Badge>
                        <span className="text-sm">{logData.response.message}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Headers</h3>
                    <div className="rounded-md border p-4">
                      {Object.keys(logData.response.headers || {}).length > 0 ? (
                        <pre className="text-sm font-mono whitespace-pre-wrap">{formatJson(logData.response.headers)}</pre>
                      ) : (
                        <p className="text-sm text-muted-foreground">No headers provided</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Response Body</h3>
                    <div className="rounded-md border p-4">
                      {logData.response.body ? (
                        <pre className="text-sm font-mono whitespace-pre-wrap">{formatJson(logData.response.body)}</pre>
                      ) : (
                        <p className="text-sm text-muted-foreground">No response body</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="metadata" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">System Information</h3>
                <div className="rounded-md border p-4 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm font-medium">Hostname:</span>
                    <span className="text-sm col-span-2">{logData.hostname}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm font-medium">Process ID:</span>
                    <span className="text-sm col-span-2">{logData.pid}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm font-medium">Log Level:</span>
                    <span className="text-sm col-span-2">{logData.level}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Timing Information</h3>
                <div className="rounded-md border p-4 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm font-medium">Timestamp:</span>
                    <span className="text-sm col-span-2">{new Date(logData.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm font-medium">Unix Time:</span>
                    <span className="text-sm col-span-2">{logData.time}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm font-medium">Response Time:</span>
                    <span className="text-sm col-span-2">
                      {formatTime(isGraphQLLog ? logData.duration : logData.response.time)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">MongoDB ID</h3>
                <div className="rounded-md border p-4">
                  <p className="text-sm font-mono">{logData._id.$oid}</p>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DrawerFooter className="border-t pt-4">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(logData, null, 2));
              }}
            >
              <FileJson className="mr-2 h-4 w-4" />
              Copy as JSON
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">
                <X className="mr-2 h-4 w-4" />
                Close
              </Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

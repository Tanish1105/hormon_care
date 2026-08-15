#import <React/RCTBridgeModule.h>

@interface JeevanmHttp : NSObject <RCTBridgeModule>
@end

@implementation JeevanmHttp

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(request:(NSString *)url
                  method:(NSString *)method
                  headers:(NSDictionary *)headers
                  body:(NSString *)body
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  NSURL *nsurl = [NSURL URLWithString:url];
  if (!nsurl) {
    reject(@"EINVAL", @"Invalid URL", nil);
    return;
  }

  NSMutableURLRequest *req = [NSMutableURLRequest requestWithURL:nsurl];
  req.HTTPMethod = method.length ? method : @"GET";
  req.timeoutInterval = 20;
  // JS fetch/XHR cannot set Cookie; URLSession can.
  req.HTTPShouldHandleCookies = NO;

  for (NSString *key in headers) {
    id value = headers[key];
    if (value == nil || value == [NSNull null]) {
      continue;
    }
    [req setValue:[NSString stringWithFormat:@"%@", value] forHTTPHeaderField:key];
  }

  if (body.length > 0) {
    req.HTTPBody = [body dataUsingEncoding:NSUTF8StringEncoding];
  }

  NSURLSessionDataTask *task = [[NSURLSession sharedSession]
      dataTaskWithRequest:req
        completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
          if (error) {
            reject(@"ENET", error.localizedDescription, error);
            return;
          }

          NSHTTPURLResponse *http = (NSHTTPURLResponse *)response;
          NSMutableDictionary *hdrs = [NSMutableDictionary new];
          [http.allHeaderFields enumerateKeysAndObjectsUsingBlock:^(id key, id obj, BOOL *stop) {
            hdrs[[[key description] lowercaseString]] = [obj description];
          }];

          NSString *text =
              data ? [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding] : @"";
          resolve(@{
            @"status" : @(http.statusCode),
            @"headers" : hdrs,
            @"body" : text ?: @""
          });
        }];
  [task resume];
}

@end

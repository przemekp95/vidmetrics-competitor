export type ChannelLookup =
  | {
      type: "handle";
      value: string;
    }
  | {
      type: "id";
      value: string;
    }
  | {
      type: "username";
      value: string;
    };

export interface ChannelLookupResolver {
  resolve(channelUrl: string): Promise<ChannelLookup>;
}

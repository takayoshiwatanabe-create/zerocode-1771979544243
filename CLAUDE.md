# Project Design Specification

This file is the single source of truth for this project. All code must conform to this specification.

## Constitution (Project Rules)
スタンプカードアプリ - 子供のお手伝い管理アプリ。React Native + Expo で実装。シンプルなUI、楽しいアニメーション。

## Design Specification
{"screens":["ホーム画面（スタンプカード表示）","スタンプ押す画面","ご褒美画面"],"features":["スタンプを押す","スタンプカウント管理","10個達成でご褒美メッセージ","リセット機能"],"tech":"React Native, Expo, AsyncStorage"}

## Development Instructions
Expo managed workflow。AsyncStorageでローカル保存。アニメーションにreact-native-reanimatedを使用。子供向けのカラフルなUI。

## Technical Stack
- React Native + Expo SDK 52 + TypeScript (strict mode)
- Expo Router for navigation
- Jest for unit tests
- EAS Build + EAS Submit for deployment

## Code Standards
- TypeScript strict mode, no `any`
- Minimal comments — code should be self-documenting
- Use path alias `@/` for imports from project root
- All components use functional style with proper typing
- Use StyleSheet.create for styles
- Follow React Native best practices for cross-platform compatibility

## Important Deadlines
- 2026年4月28日までにXcode 26対応が必要。ExpoがSDK対応を出し次第、eas build コマンドを再実行するだけで対応完了。期限1週間前に確認すること。

import { useRef, useState, FC } from "react";
// 1. 從 'wasmoon' 引入型別
import { LuaFactory, LuaEngine } from "wasmoon";

// 建立 factory 的部分維持不變
const factory = new LuaFactory();

// 2. 使用 React.FC (Functional Component) 來定義元件型別
const LuaRunner: FC = () => {
  // 3. 為 useState 提供明確的型別
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // 4. 為 useRef 指定它將引用的 HTML 元素型別
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleRunLua = async (): Promise<void> => {
    if (!textareaRef.current || isRunning) return;

    setIsRunning(true);
    setOutput("Running code...");

    const code = textareaRef.current.value;
    // 5. 為 lua 變數指定型別
    let lua: LuaEngine | null = null;

    try {
      lua = await factory.createEngine();

      const logs: string[] = [];
      // 6. 為 'print' 函式的參數提供型別
      await lua.global.set("print", (...args: unknown[]) => {
        const stringArgs = args.map(arg => String(arg));
        logs.push(stringArgs.join("\t"));
      });

      await lua.doString(code);
      setOutput(logs.join("\n") || "(No output)");
    } catch (e: unknown) { // 7. 捕捉錯誤時，使用 'unknown' 型別
      // 進行型別檢查以安全地存取錯誤訊息
      const errorMessage = e instanceof Error ? e.message : String(e);
      setOutput(`Error: ${errorMessage}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div>
      <textarea
        ref={textareaRef}
        rows={12}
        cols={60}
        spellCheck={false}
        defaultValue={`-- 您的 Lua 程式碼將透過 WebAssembly 在瀏覽器中執行！
function task(n)
    local acc = 0
    for i = 1, 100 do
        acc = acc + i
    end
    local result = string.format("⚡ task result -- %d", acc)
    print(result);
end

print("Hello from Lua!")
task()
print("Current time from OS:", os.date())
`}
        style={{ fontFamily: "monospace", fontSize: "14px", border: "1px solid #ccc", borderRadius: "4px" }}
      />
      <br />
      <button onClick={handleRunLua} disabled={isRunning}>
        {isRunning ? "執行中..." : "執行 Lua 程式碼"}
      </button>
      <pre
        style={{
          background: "#282c34",
          color: "#79cca5ff",
          padding: "16px",
          marginTop: "1em",
          minHeight: "4em",
          borderRadius: "4px",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
        }}
      >
        {output}
      </pre>
    </div>
  );
};

export default LuaRunner;
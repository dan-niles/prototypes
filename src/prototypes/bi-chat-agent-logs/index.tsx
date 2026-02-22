import { useState } from "react";
import {
  TraceTree,
  type TraceNode,
} from "./components/TraceTree";
import { SpanDetail } from "./components/SpanDetail";
import { WaterfallView } from "./components/WaterfallView";
import { TraceListView } from "./components/TraceListView";
import { ChatWindow } from "./components/ChatWindow";
import { ChartGantt, Download, ArrowLeft, MessageSquare, ListTree, Info } from "lucide-react";

// Mock trace data - designed for visual demo with staggered timing
const traceData: TraceNode[] = [
  {
    id: "1",
    type: "invoke_agent",
    name: "Math Tutor",
    duration: "3.85s",
    spanData: {
      spanId: "60ccfae73a95e56c",
      traceId: "b3db3ab26b48c4934dbfded4776686b8",
      parentSpanId: "d7f639f0165a5fd9",
      startTime: "2026-01-11T20:40:50.000Z",
      endTime: "2026-01-11T20:40:54.000Z",
      duration: "3848ms",
      badge: "CLIENT",
      attributes: [
        {
          key: "gen_ai.input.messages",
          value: "How much is 1+8*9?",
        },
        { key: "entrypoint.resource.accessor", value: "post" },
        {
          key: "entrypoint.function.module",
          value: "domniles/MathTutor:0.1.0",
        },
        { key: "entrypoint.service.name", value: "/MathTutor" },
        {
          key: "gen_ai.system_instructions",
          value:
            "# Role Math Tutor # Instructions You are a math tutor assistant who helps students solve math problems.Provide clear, step-by-step instructions to guide them toward the final answer.Be sure to include the final answer at the end.Always use the available tools to perform any necessary calculations.",
        },
        {
          key: "gen_ai.agent.name",
          value: "Math Tutor",
        },
        { key: "span.type", value: "ai" },
        { key: "gen_ai.provider.name", value: "Ballerina" },
        { key: "entrypoint.function.name", value: "/chat" },
        { key: "span.kind", value: "client" },
        { key: "gen_ai.operation.name", value: "invoke_agent" },
        {
          key: "gen_ai.conversation.id",
          value: "8e3d1d89-182b-4c74-8c13-8c3a11cf46af",
        },
        {
          key: "gen_ai.output.messages",
          value:
            "To solve the expression \\( 1 + 8 \\times 9 \\), we follow the order of operations (PEMDAS/BODMAS): 1. First, we multiply \\( 8 \\times 9 = 72 \\). 2. Then, we add \\( 1 + 72 = 73 \\). So, the final answer is **73**.",
        },
        {
          key: "gen_ai.agent.id",
          value: "dc45aec4-b9c2-4579-8c27-720ed54e66e9",
        },
        { key: "gen_ai.output.type", value: "text" },
      ],
    },
    children: [
      {
        id: "2",
        type: "chat",
        name: "chat gpt-4o-mini",
        duration: "1.68s",
        spanData: {
          spanId: "2afb5940b2d551d1",
          traceId: "b3db3ab26b48c4934dbfded4776686b8",
          parentSpanId: "b9bb1c775868cf7b",
          startTime: "2026-01-11T20:40:50.000Z",
          endTime: "2026-01-11T20:40:52.000Z",
          duration: "1681ms",
          badge: "CLIENT",
          attributes: [
            {
              key: "gen_ai.request.model",
              value: "gpt-4o-mini",
            },
            {
              key: "gen_ai.output.messages",
              value:
                '{"role":"assistant", "content":"To solve the expression \\(1 + 8 \\times 9\\), we need to follow the order of operations (PEMDAS/BODMAS), which states that we should perform multiplication before addition.\\n\\n1. First, calculate \\(8 \\times 9\\).\\n2. Then, add the result to \\(1\\).\\n\\nLet\'s start with the multiplication. I\'ll calculate \\(8 \\times 9\\) now.", "toolCalls":[{"name":"multiplyTool", "arguments":{"num1":8, "num2":9}}]}',
            },
            { key: "gen_ai.output.type", value: "text" },
            {
              key: "gen_ai.response.id",
              value: "chatcmpl-CwrNb5jQJCQcb4sNCB9oW2NdjnP34",
            },
            { key: "gen_ai.request.temperature", value: "0.7" },
            { key: "span.kind", value: "client" },
            { key: "gen_ai.operation.name", value: "chat" },
            { key: "gen_ai.usage.input_tokens", value: "250" },
            { key: "entrypoint.function.name", value: "/chat" },
            { key: "span.type", value: "ai" },
            { key: "gen_ai.provider.name", value: "WSO2" },
            {
              key: "entrypoint.resource.accessor",
              value: "post",
            },
            {
              key: "gen_ai.input.messages",
              value:
                '[{"role":"system", "content":"# Role \\nMath Tutor \\n\\n# Instructions \\nYou are a math tutor assistant who helps students solve math problems.Provide clear, step-by-step instructions to guide them toward the final answer.Be sure to include the final answer at the end.Always use the available tools to perform any necessary calculations.", "name":null}, {"role":"user", "content":"Hi", "name":null}, {"role":"assistant", "content":"Hello! How can I assist you with your math problems today?", "toolCalls":null}, {"role":"user", "content":"How much is 1+8*9? (Use the available tools)", "name":null}]',
            },
            {
              key: "gen_ai.input.tools",
              value:
                '[{"name":"divideTool", "description":"Calculates the division of two numbers Handles division by zero If num2 is zero, returns 0 Otherwise, returns the result of the division", "parameters":{"type":"object", "required":["num1", "num2"], "properties":{"num1":{"type":"integer", "format":"int64"}, "num2":{"type":"integer", "format":"int64"}}}}, {"name":"multiplyTool", "description":"Calculates the product of two numbers", "parameters":{"type":"object", "required":["num1", "num2"], "properties":{"num1":{"type":"integer", "format":"int64"}, "num2":{"type":"integer", "format":"int64"}}}}, {"name":"subtractTool", "description":"Calculates the difference of two numbers", "parameters":{"type":"object", "required":["num1", "num2"], "properties":{"num1":{"type":"integer", "format":"int64"}, "num2":{"type":"integer", "format":"int64"}}}}, {"name":"sumTool", "description":"Calculates the sum of two numbers", "parameters":{"type":"object", "required":["num1", "num2"], "properties":{"num1":{"type":"integer", "format":"int64"}, "num2":{"type":"integer", "format":"int64"}}}}]',
            },
            { key: "gen_ai.usage.output_tokens", value: "107" },
            {
              key: "entrypoint.function.module",
              value: "danniles/MathTutor:0.1.0",
            },
            {
              key: "entrypoint.service.name",
              value: "/MathTutor",
            },
          ],
        },
        children: [],
      },
      {
        id: "3",
        type: "execute_tool",
        name: "execute_tool multiplyTool",
        duration: "0.01s",
        spanData: {
          spanId: "3a3566911f7357eb",
          traceId: "b3db3ab26b48c4934dbfded4776686b8",
          parentSpanId: "60ccfae73a95e56c",
          startTime: "2026-01-11T20:40:52.000Z",
          endTime: "2026-01-11T20:40:52.000Z",
          duration: "9ms",
          badge: "CLIENT",
          attributes: [
            {
              key: "gen_ai.tool.arguments",
              value: '{"num1":8, "num2":9}',
            },
            { key: "entrypoint.function.name", value: "/chat" },
            { key: "span.type", value: "ai" },
            {
              key: "entrypoint.resource.accessor",
              value: "post",
            },
            { key: "span.kind", value: "client" },
            {
              key: "gen_ai.operation.name",
              value: "execute_tool",
            },
            {
              key: "gen_ai.tool.description",
              value: "Calculates the product of two numbers",
            },
            {
              key: "entrypoint.function.module",
              value: "danniles/MathTutor:0.1.0",
            },
            {
              key: "entrypoint.service.name",
              value: "/MathTutor",
            },
            { key: "gen_ai.tool.name", value: "multiplyTool" },
            { key: "gen_ai.tool.type", value: "function" },
            { key: "gen_ai.tool.output", value: "72" },
          ],
        },
        children: [],
      },
      {
        id: "4",
        type: "chat",
        name: "chat gpt-4o-mini",
        duration: "0.80s",
        spanData: {
          spanId: "c12920b3fbbaa484",
          traceId: "b3db3ab26b48c4934dbfded4776686b8",
          parentSpanId: "cda54161b0d29264",
          startTime: "2026-01-11T20:40:52.000Z",
          endTime: "2026-01-11T20:40:53.000Z",
          duration: "796ms",
          badge: "CLIENT",
          attributes: [
            {
              key: "gen_ai.request.model",
              value: "gpt-4o-mini",
            },
            {
              key: "gen_ai.output.messages",
              value:
                '{"role":"assistant", "content":null, "toolCalls":[{"name":"sumTool", "arguments":{"num1":1, "num2":72}}]}',
            },
            { key: "gen_ai.output.type", value: "text" },
            {
              key: "gen_ai.response.id",
              value: "chatcmpl-CwrNcwzRIUBC88xLZSD5nZ60wPZdy",
            },
            { key: "gen_ai.request.temperature", value: "0.7" },
            { key: "span.kind", value: "client" },
            { key: "gen_ai.operation.name", value: "chat" },
            { key: "gen_ai.usage.input_tokens", value: "279" },
            { key: "entrypoint.function.name", value: "/chat" },
            { key: "span.type", value: "ai" },
            { key: "gen_ai.provider.name", value: "WSO2" },
            {
              key: "entrypoint.resource.accessor",
              value: "post",
            },
            {
              key: "gen_ai.input.messages",
              value:
                '[{"role":"system", "content":"# Role \\nMath Tutor \\n\\n# Instructions \\nYou are a math tutor assistant who helps students solve math problems.Provide clear, step-by-step instructions to guide them toward the final answer.Be sure to include the final answer at the end.Always use the available tools to perform any necessary calculations.", "name":null}, {"role":"user", "content":"Hi", "name":null}, {"role":"assistant", "content":"Hello! How can I assist you with your math problems today?", "toolCalls":null}, {"role":"user", "content":"How much is 1+8*9? (Use the available tools)", "name":null}, {"role":"assistant", "content":null, "toolCalls":[{"name":"multiplyTool", "arguments":{"num1":8, "num2":9}}]}, {"role":"function", "content":"72", "name":"multiplyTool"}]',
            },
            {
              key: "gen_ai.input.tools",
              value:
                '[{"name":"divideTool", "description":"Calculates the division of two numbers Handles division by zero If num2 is zero, returns 0 Otherwise, returns the result of the division", "parameters":{"type":"object", "required":["num1", "num2"], "properties":{"num1":{"type":"integer", "format":"int64"}, "num2":{"type":"integer", "format":"int64"}}}}, {"name":"multiplyTool", "description":"Calculates the product of two numbers", "parameters":{"type":"object", "required":["num1", "num2"], "properties":{"num1":{"type":"integer", "format":"int64"}, "num2":{"type":"integer", "format":"int64"}}}}, {"name":"subtractTool", "description":"Calculates the difference of two numbers", "parameters":{"type":"object", "required":["num1", "num2"], "properties":{"num1":{"type":"integer", "format":"int64"}, "num2":{"type":"integer", "format":"int64"}}}}, {"name":"sumTool", "description":"Calculates the sum of two numbers", "parameters":{"type":"object", "required":["num1", "num2"], "properties":{"num1":{"type":"integer", "format":"int64"}, "num2":{"type":"integer", "format":"int64"}}}}]',
            },
            { key: "gen_ai.usage.output_tokens", value: "21" },
            {
              key: "entrypoint.function.module",
              value: "danniles/MathTutor:0.1.0",
            },
            {
              key: "entrypoint.service.name",
              value: "/MathTutor",
            },
          ],
        },
        children: [],
      },
      {
        id: "5",
        type: "execute_tool",
        name: "execute_tool sumTool",
        duration: "0.00s",
        spanData: {
          spanId: "dcf4048a9c6995d9",
          traceId: "b3db3ab26b48c4934dbfded4776686b8",
          parentSpanId: "60ccfae73a95e56c",
          startTime: "2026-01-11T20:40:53.000Z",
          endTime: "2026-01-11T20:40:53.000Z",
          duration: "0ms",
          badge: "CLIENT",
          attributes: [
            {
              key: "gen_ai.tool.arguments",
              value: '{"num1":1, "num2":72}',
            },
            { key: "entrypoint.function.name", value: "/chat" },
            { key: "span.type", value: "ai" },
            {
              key: "entrypoint.resource.accessor",
              value: "post",
            },
            { key: "span.kind", value: "client" },
            {
              key: "gen_ai.operation.name",
              value: "execute_tool",
            },
            {
              key: "gen_ai.tool.description",
              value: "Calculates the sum of two numbers",
            },
            {
              key: "entrypoint.function.module",
              value: "danniles/MathTutor:0.1.0",
            },
            {
              key: "entrypoint.service.name",
              value: "/MathTutor",
            },
            { key: "gen_ai.tool.name", value: "sumTool" },
            { key: "gen_ai.tool.type", value: "function" },
            { key: "gen_ai.tool.output", value: "73" },
          ],
        },
        children: [],
      },
      {
        id: "6",
        type: "chat",
        name: "chat gpt-4o-mini",
        duration: "1.35s",
        spanData: {
          spanId: "899559cb6323690f",
          traceId: "b3db3ab26b48c4934dbfded4776686b8",
          parentSpanId: "611142e616682dda",
          startTime: "2026-01-11T20:40:53.000Z",
          endTime: "2026-01-11T20:40:54.000Z",
          duration: "1348ms",
          badge: "CLIENT",
          attributes: [
            {
              key: "gen_ai.request.model",
              value: "gpt-4o-mini",
            },
            {
              key: "gen_ai.output.messages",
              value:
                '{"role":"assistant", "content":"To solve the expression \\\\( 1 + 8 \\\\times 9 \\\\), we follow the order of operations (PEMDAS/BODMAS):\\n\\n1. First, we multiply \\\\( 8 \\\\times 9 = 72 \\\\).\\n2. Then, we add \\\\( 1 + 72 = 73 \\\\).\\n\\nSo, the final answer is **73**.", "toolCalls":null}',
            },
            {
              key: "gen_ai.response.id",
              value: "chatcmpl-CwrNdglfEolW3ZzhaXzye4J3AVENH",
            },
            { key: "gen_ai.request.temperature", value: "0.7" },
            { key: "span.kind", value: "client" },
            { key: "gen_ai.operation.name", value: "chat" },
            { key: "gen_ai.usage.input_tokens", value: "308" },
            { key: "entrypoint.function.name", value: "/chat" },
            { key: "span.type", value: "ai" },
            { key: "gen_ai.provider.name", value: "WSO2" },
            {
              key: "entrypoint.resource.accessor",
              value: "post",
            },
            {
              key: "gen_ai.input.messages",
              value:
                '[{"role":"system", "content":"# Role \\nMath Tutor \\n\\n# Instructions \\nYou are a math tutor assistant who helps students solve math problems.Provide clear, step-by-step instructions to guide them toward the final answer.Be sure to include the final answer at the end.Always use the available tools to perform any necessary calculations.", "name":null}, {"role":"user", "content":"Hi", "name":null}, {"role":"assistant", "content":"Hello! How can I assist you with your math problems today?", "toolCalls":null}, {"role":"user", "content":"How much is 1+8*9? (Use the available tools)", "name":null}, {"role":"assistant", "content":null, "toolCalls":[{"name":"multiplyTool", "arguments":{"num1":8, "num2":9}}]}, {"role":"function", "content":"72", "name":"multiplyTool"}, {"role":"assistant", "content":null, "toolCalls":[{"name":"sumTool", "arguments":{"num1":1, "num2":72}}]}, {"role":"function", "content":"73", "name":"sumTool"}]',
            },
            {
              key: "gen_ai.input.tools",
              value:
                '[{"name":"divideTool", "description":"Calculates the division of two numbers Handles division by zero If num2 is zero, returns 0 Otherwise, returns the result of the division", "parameters":{"type":"object", "required":["num1", "num2"], "properties":{"num1":{"type":"integer", "format":"int64"}, "num2":{"type":"integer", "format":"int64"}}}}, {"name":"multiplyTool", "description":"Calculates the product of two numbers", "parameters":{"type":"object", "required":["num1", "num2"], "properties":{"num1":{"type":"integer", "format":"int64"}, "num2":{"type":"integer", "format":"int64"}}}}, {"name":"subtractTool", "description":"Calculates the difference of two numbers", "parameters":{"type":"object", "required":["num1", "num2"], "properties":{"num1":{"type":"integer", "format":"int64"}, "num2":{"type":"integer", "format":"int64"}}}}, {"name":"sumTool", "description":"Calculates the sum of two numbers", "parameters":{"type":"object", "required":["num1", "num2"], "properties":{"num1":{"type":"integer", "format":"int64"}, "num2":{"type":"integer", "format":"int64"}}}}]',
            },
            { key: "gen_ai.usage.output_tokens", value: "77" },
            {
              key: "entrypoint.function.module",
              value: "danniles/MathTutor:0.1.0",
            },
            {
              key: "entrypoint.service.name",
              value: "/MathTutor",
            },
          ],
        },
        children: [],
      },
    ],
  },
  {
    id: "6",
    type: "invoke_agent",
    name: "Math Tutor",
    duration: "2.42s",
    spanData: {
      spanId: "a1b2c3d4e5f6g7h8",
      traceId: "c4ed4bc37c59d5a45ecgfefe5887797c9",
      parentSpanId: "e8g740g1266b6ge0",
      startTime: "2026-01-11T20:41:10.000Z",
      endTime: "2026-01-11T20:41:12.000Z",
      duration: "2420ms",
      badge: "CLIENT",
      attributes: [
        {
          key: "gen_ai.input.messages",
          value: "What is 15 - 3 * 2?",
        },
        { key: "entrypoint.resource.accessor", value: "post" },
        {
          key: "entrypoint.function.module",
          value: "domniles/MathTutor:0.1.0",
        },
        { key: "entrypoint.service.name", value: "/MathTutor" },
        {
          key: "gen_ai.system_instructions",
          value:
            "# Role Math Tutor # Instructions You are a math tutor assistant who helps students solve math problems.Provide clear, step-by-step instructions to guide them toward the final answer.Be sure to include the final answer at the end.Always use the available tools to perform any necessary calculations.",
        },
        {
          key: "gen_ai.agent.name",
          value: "Math Tutor",
        },
        { key: "span.type", value: "ai" },
        { key: "gen_ai.provider.name", value: "Ballerina" },
        { key: "entrypoint.function.name", value: "/chat" },
        { key: "span.kind", value: "client" },
        { key: "gen_ai.operation.name", value: "invoke_agent" },
        {
          key: "gen_ai.conversation.id",
          value: "9f4e2e8a-293c-5d85-9d24-9d4b22dg57bg",
        },
        {
          key: "gen_ai.output.messages",
          value:
            "To solve \\( 15 - 3 \\times 2 \\), we follow the order of operations: 1. First, multiply \\( 3 \\times 2 = 6 \\). 2. Then, subtract \\( 15 - 6 = 9 \\). The final answer is **9**.",
        },
        {
          key: "gen_ai.agent.id",
          value: "ed56bfd5-c0d3-5680-9d38-831fe65f77fa",
        },
        { key: "gen_ai.output.type", value: "text" },
      ],
    },
    children: [
      {
        id: "8",
        type: "chat",
        name: "chat gpt-4o-mini",
        duration: "1.12s",
        spanData: {
          spanId: "3bgc6051c3e662e2",
          traceId: "c4ed4bc37c59d5a45ecgfefe5887797c9",
          parentSpanId: "c0cc2d886969dg8c",
          startTime: "2026-01-11T20:41:10.000Z",
          endTime: "2026-01-11T20:41:11.000Z",
          duration: "1122ms",
          badge: "CLIENT",
          attributes: [
            {
              key: "gen_ai.request.model",
              value: "gpt-4o-mini",
            },
            {
              key: "gen_ai.output.messages",
              value:
                '{"role":"assistant", "content":"To solve \\( 15 - 3 \\times 2 \\), we need to follow the order of operations. We should multiply first, then subtract.\\n\\n1. First, calculate \\( 3 \\times 2 \\).\\n2. Then, subtract the result from \\( 15 \\).\\n\\nLet\'s start by calculating the multiplication.", "toolCalls":[{"name":"multiplyTool", "arguments":{"num1":3, "num2":2}}]}',
            },
            { key: "gen_ai.output.type", value: "text" },
            {
              key: "gen_ai.response.id",
              value: "chatcmpl-CwrOp6kRKDRDd5tODC0pX3OekqQ45",
            },
            { key: "gen_ai.request.temperature", value: "0.7" },
            { key: "span.kind", value: "client" },
            { key: "gen_ai.operation.name", value: "chat" },
            { key: "gen_ai.usage.input_tokens", value: "245" },
            { key: "entrypoint.function.name", value: "/chat" },
            { key: "span.type", value: "ai" },
            { key: "gen_ai.provider.name", value: "WSO2" },
            {
              key: "entrypoint.resource.accessor",
              value: "post",
            },
            {
              key: "gen_ai.input.messages",
              value:
                '[{"role":"system", "content":"# Role \\nMath Tutor \\n\\n# Instructions \\nYou are a math tutor assistant who helps students solve math problems.Provide clear, step-by-step instructions to guide them toward the final answer.Be sure to include the final answer at the end.Always use the available tools to perform any necessary calculations.", "name":null}, {"role":"user", "content":"What is 15 - 3 * 2?", "name":null}]',
            },
            {
              key: "gen_ai.input.tools",
              value:
                '[{"name":"divideTool", "description":"Calculates the division of two numbers Handles division by zero If num2 is zero, returns 0 Otherwise, returns the result of the division", "parameters":{"type":"object", "required":["num1", "num2"], "properties":{"num1":{"type":"integer", "format":"int64"}, "num2":{"type":"integer", "format":"int64"}}}}, {"name":"multiplyTool", "description":"Calculates the product of two numbers", "parameters":{"type":"object", "required":["num1", "num2"], "properties":{"num1":{"type":"integer", "format":"int64"}, "num2":{"type":"integer", "format":"int64"}}}}, {"name":"subtractTool", "description":"Calculates the difference of two numbers", "parameters":{"type":"object", "required":["num1", "num2"], "properties":{"num1":{"type":"integer", "format":"int64"}, "num2":{"type":"integer", "format":"int64"}}}}, {"name":"sumTool", "description":"Calculates the sum of two numbers", "parameters":{"type":"object", "required":["num1", "num2"], "properties":{"num1":{"type":"integer", "format":"int64"}, "num2":{"type":"integer", "format":"int64"}}}}]',
            },
            { key: "gen_ai.usage.output_tokens", value: "95" },
            {
              key: "entrypoint.function.module",
              value: "danniles/MathTutor:0.1.0",
            },
            {
              key: "entrypoint.service.name",
              value: "/MathTutor",
            },
          ],
        },
        children: [],
      },
      {
        id: "9",
        type: "execute_tool",
        name: "execute_tool multiplyTool",
        duration: "0.01s",
        spanData: {
          spanId: "4b4677a22g8468fc",
          traceId: "c4ed4bc37c59d5a45ecgfefe5887797c9",
          parentSpanId: "a1b2c3d4e5f6g7h8",
          startTime: "2026-01-11T20:41:11.000Z",
          endTime: "2026-01-11T20:41:11.000Z",
          duration: "8ms",
          badge: "CLIENT",
          attributes: [
            {
              key: "gen_ai.tool.arguments",
              value: '{"num1":3, "num2":2}',
            },
            { key: "entrypoint.function.name", value: "/chat" },
            { key: "span.type", value: "ai" },
            {
              key: "entrypoint.resource.accessor",
              value: "post",
            },
            { key: "span.kind", value: "client" },
            {
              key: "gen_ai.operation.name",
              value: "execute_tool",
            },
            {
              key: "gen_ai.tool.description",
              value: "Calculates the product of two numbers",
            },
            {
              key: "entrypoint.function.module",
              value: "danniles/MathTutor:0.1.0",
            },
            {
              key: "entrypoint.service.name",
              value: "/MathTutor",
            },
            { key: "gen_ai.tool.name", value: "multiplyTool" },
            { key: "gen_ai.tool.type", value: "function" },
            { key: "gen_ai.tool.output", value: "6" },
          ],
        },
        children: [],
      },
      {
        id: "10",
        type: "chat",
        name: "chat gpt-4o-mini",
        duration: "1.28s",
        spanData: {
          spanId: "d13031c4gcccbb595",
          traceId: "c4ed4bc37c59d5a45ecgfefe5887797c9",
          parentSpanId: "deb65272c1e30375",
          startTime: "2026-01-11T20:41:11.000Z",
          endTime: "2026-01-11T20:41:12.000Z",
          duration: "1281ms",
          badge: "CLIENT",
          attributes: [
            {
              key: "gen_ai.request.model",
              value: "gpt-4o-mini",
            },
            {
              key: "gen_ai.output.messages",
              value:
                '{"role":"assistant", "content":"To solve \\\\( 15 - 3 \\\\times 2 \\\\), we follow the order of operations: 1. First, multiply \\\\( 3 \\\\times 2 = 6 \\\\). 2. Then, subtract \\\\( 15 - 6 = 9 \\\\). The final answer is **9**.", "toolCalls":null}',
            },
            {
              key: "gen_ai.response.id",
              value: "chatcmpl-CwrOqxaSMVCD99yMaYE6oZ71xlR56",
            },
            { key: "gen_ai.request.temperature", value: "0.7" },
            { key: "span.kind", value: "client" },
            { key: "gen_ai.operation.name", value: "chat" },
            { key: "gen_ai.usage.input_tokens", value: "274" },
            { key: "entrypoint.function.name", value: "/chat" },
            { key: "span.type", value: "ai" },
            { key: "gen_ai.provider.name", value: "WSO2" },
            {
              key: "entrypoint.resource.accessor",
              value: "post",
            },
            {
              key: "gen_ai.input.messages",
              value:
                '[{"role":"system", "content":"# Role \\\\nMath Tutor \\\\n\\\\n# Instructions \\\\nYou are a math tutor assistant who helps students solve math problems.Provide clear, step-by-step instructions to guide them toward the final answer.Be sure to include the final answer at the end.Always use the available tools to perform any necessary calculations.", "name":null}, {"role":"user", "content":"What is 15 - 3 * 2?", "name":null}, {"role":"assistant", "content":null, "toolCalls":[{"name":"multiplyTool", "arguments":{"num1":3, "num2":2}}]}, {"role":"function", "content":"6", "name":"multiplyTool"}]',
            },
            {
              key: "gen_ai.input.tools",
              value:
                '[{"name":"divideTool", "description":"Calculates the division of two numbers Handles division by zero If num2 is zero, returns 0 Otherwise, returns the result of the division", "parameters":{"type":"object", "required":["num1", "num2"], "properties":{"num1":{"type":"integer", "format":"int64"}, "num2":{"type":"integer", "format":"int64"}}}}, {"name":"multiplyTool", "description":"Calculates the product of two numbers", "parameters":{"type":"object", "required":["num1", "num2"], "properties":{"num1":{"type":"integer", "format":"int64"}, "num2":{"type":"integer", "format":"int64"}}}}, {"name":"subtractTool", "description":"Calculates the difference of two numbers", "parameters":{"type":"object", "required":["num1", "num2"], "properties":{"num1":{"type":"integer", "format":"int64"}, "num2":{"type":"integer", "format":"int64"}}}}, {"name":"sumTool", "description":"Calculates the sum of two numbers", "parameters":{"type":"object", "required":["num1", "num2"], "properties":{"num1":{"type":"integer", "format":"int64"}, "num2":{"type":"integer", "format":"int64"}}}}]',
            },
            { key: "gen_ai.usage.output_tokens", value: "68" },
            {
              key: "entrypoint.function.module",
              value: "danniles/MathTutor:0.1.0",
            },
            {
              key: "entrypoint.service.name",
              value: "/MathTutor",
            },
          ],
        },
        children: [],
      },
    ],
  },
  {
    id: "7",
    type: "invoke_agent",
    name: "Math Tutor",
    duration: "0.45s",
    spanData: {
      spanId: "e8f9a1b2c3d4e5f6",
      traceId: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
      parentSpanId: "f7e6d5c4b3a29180",
      startTime: "2026-01-13T06:25:48.000Z",
      endTime: "2026-01-13T06:25:48.450Z",
      duration: "450ms",
      badge: "CLIENT",
      attributes: [
        {
          key: "gen_ai.input.messages",
          value: "What is the square root of 144?",
        },
        { key: "entrypoint.resource.accessor", value: "post" },
        {
          key: "entrypoint.function.module",
          value: "danniles/MathTutor:0.1.0",
        },
        { key: "entrypoint.service.name", value: "/MathTutor" },
        {
          key: "gen_ai.system_instructions",
          value:
            "# Role Math Tutor # Instructions You are a math tutor assistant who helps students solve math problems.",
        },
        {
          key: "gen_ai.agent.name",
          value: "Math Tutor",
        },
        { key: "span.type", value: "ai" },
        { key: "gen_ai.provider.name", value: "Ballerina" },
        { key: "entrypoint.function.name", value: "/chat" },
        { key: "span.kind", value: "client" },
        { key: "gen_ai.operation.name", value: "invoke_agent" },
        {
          key: "gen_ai.conversation.id",
          value: "7f2e3a4b-5c6d-7e8f-9a0b-1c2d3e4f5a6b",
        },
        {
          key: "error.message",
          value: 'Unable to obtain valid answer from the agent {"steps":[error LlmConnectionError ("Error while connecting to the model",error ClientRequestError ("Unauthorized",statusCode=401,headers={"cf-cache-status":["DYNAMIC"],"cf-ray":["9bd2d1831c3aff85-SIN"],"content-length":["159"],"content-type":["text/plain"],"date":["Tue, 13 Jan 2026 06:25:48 GMT"],"server":["cloudflare"],"set-cookie":["route=1768285549.764.2718.645023|d4d40829238dd45ac36230e5b0d2984e; Path=/ballerina-copilot/v2.0(/|$)(.*); Secure; HttpOnly"],"strict-transport-security":["max-age=31536000; includeSubDomains; preload"],"www-authenticate":["Bearer realm="Choreo Connect", error="invalid_token", error_description="The provided token is invalid""],"x-content-type-options":["nosniff"],"x-http2-stream-id":["3"],"x-trace-key":["346522662624648434"]},body="{"error_message":"Invalid Credentials","code":"900901","error_description":"Invalid Credentials. Make sure you have provided the correct security credentials"}"))]} at ballerina.ai.1:constructError(agent.bal:219) ballerina.ai.1:getAnswer(agent.bal:203) ballerina.ai.1.Agent:runInternal(agent.bal:158) ballerina.ai.1.Agent:run(agent.bal:128) danniles.MathTutor.0.$anonType$_30:$post$chat(main.bal:17)',
        },
        {
          key: "gen_ai.agent.id",
          value: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
        },
      ],
    },
    children: [],
  },
];

export default function App() {
  const [selectedNode, setSelectedNode] =
    useState<TraceNode | null>(null);
  const [selectedTrace, setSelectedTrace] = useState<TraceNode | null>(null);
  const [viewMode, setViewMode] = useState<
    "tree" | "waterfall"
  >("tree");
  const [currentView, setCurrentView] = useState<'chat' | 'list' | 'detail'>('chat');
  const [previousView, setPreviousView] = useState<'chat' | 'list'>('chat');

  const exportToJSON = () => {
    const dataStr = JSON.stringify(traceData, null, 2);
    const dataBlob = new Blob([dataStr], {
      type: "application/json",
    });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "trace-data.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleTraceSelect = (trace: TraceNode) => {
    setSelectedTrace(trace);
    setSelectedNode(trace);
    setPreviousView('list');
    setCurrentView('detail');
  };

  const handleBackToChat = () => {
    setCurrentView('chat');
    setSelectedTrace(null);
    setSelectedNode(null);
  };

  const handleBackFromDetail = () => {
    setCurrentView(previousView);
    setSelectedTrace(null);
    setSelectedNode(null);
  };

  const handleShowLogs = (traceId: string) => {
    // Find the trace with the matching ID
    const trace = traceData.find(t => t.id === traceId);
    if (trace) {
      setSelectedTrace(trace);
      setSelectedNode(trace);
      setPreviousView('chat');
      setCurrentView('detail');
    }
  };

  const handleShowOverview = () => {
    setCurrentView('list');
  };

  if (currentView === 'chat') {
    return <ChatWindow onShowLogs={handleShowLogs} onShowOverview={handleShowOverview} />;
  }

  if (currentView === 'list') {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-[600px] mx-auto p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Trace Logs</h1>
            <button
              onClick={handleBackToChat}
              className="flex items-center gap-2 px-3 py-1.5 rounded text-sm text-gray-700 hover:bg-gray-100"
            >
              <MessageSquare className="w-4 h-4" />
              Back to Chat
            </button>
          </div>
          <TraceListView traces={traceData} onTraceSelect={handleTraceSelect} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[600px] mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBackFromDetail}
            className="flex items-center gap-2 px-3 py-1.5 rounded text-sm text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-1">
            <div className="gap-1 flex">
              <button
                onClick={() => setViewMode("tree")}
                className={`p-2 rounded border ${viewMode === "tree"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                title="Tree View"
              >
                <ListTree className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("waterfall")}
                className={`p-2 rounded border ${viewMode === "waterfall"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                title="Timeline View"
              >
                <ChartGantt className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={exportToJSON}
              className="p-2 rounded text-gray-600 hover:bg-gray-100"
              title="Export JSON"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => { }}

              className="p-2 rounded text-gray-600 hover:bg-gray-100"
              title="Advanced Traces"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
          <div className="bg-gray-100 border-b border-gray-200">
            {viewMode === "tree" ? (
              <TraceTree
                nodes={selectedTrace ? [selectedTrace] : traceData}
                onNodeClick={(node) => setSelectedNode(node)}
                selectedNodeId={selectedNode?.id}
              />
            ) : (
              <WaterfallView
                nodes={selectedTrace ? [selectedTrace] : traceData}
                onNodeClick={(node) => setSelectedNode(node)}
                selectedNodeId={selectedNode?.id}
              />
            )}
          </div>
        </div>

        {selectedNode && selectedNode.spanData && (
          <SpanDetail
            spanData={selectedNode.spanData}
            spanName={selectedNode.name}
            spanType={selectedNode.type}
          />
        )}
      </div>
    </div>
  );
}

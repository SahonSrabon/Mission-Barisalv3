#!/usr/bin/env python3
"""
Agent Health Checker Script
Checks the health of various AI agents and services
"""

import asyncio
import aiohttp
import websockets
import time
import json
import os
from typing import Dict, List, Any
from dataclasses import dataclass
from datetime import datetime

@dataclass
class HealthCheckResult:
    service: str
    status: str
    response_time: float
    details: Dict[str, Any]

class AgentHealthChecker:
    def __init__(self):
        self.results: List[HealthCheckResult] = []
        self.config = {
            "api_endpoints": [
                "http://localhost:3001/health",
                "http://localhost:8000/health",
                "http://localhost:5000/api/health"
            ],
            "websocket_endpoints": [
                "ws://localhost:3001/ws",
                "ws://localhost:8000/ws"
            ],
            "test_files": [
                "test_read.txt",
                "test_write.txt"
            ]
        }

    async def check_api_endpoint(self, url: str) -> HealthCheckResult:
        """Check if API endpoint returns 200"""
        start_time = time.time()
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=5)) as response:
                    response_time = time.time() - start_time
                    status = "✅ HEALTHY" if response.status == 200 else f"❌ ERROR ({response.status})"
                    
                    try:
                        data = await response.json()
                    except:
                        data = await response.text()
                    
                    return HealthCheckResult(
                        service=f"API: {url}",
                        status=status,
                        response_time=response_time,
                        details={
                            "status_code": response.status,
                            "response": data
                        }
                    )
        except Exception as e:
            response_time = time.time() - start_time
            return HealthCheckResult(
                service=f"API: {url}",
                status="❌ UNREACHABLE",
                response_time=response_time,
                details={"error": str(e)}
            )

    async def check_websocket(self, url: str) -> HealthCheckResult:
        """Check WebSocket connection"""
        start_time = time.time()
        try:
            async with websockets.connect(url, timeout=5) as websocket:
                # Send ping message
                await websocket.send(json.dumps({"type": "ping", "timestamp": time.time()}))
                response = await asyncio.wait_for(websocket.recv(), timeout=3)
                
                response_time = time.time() - start_time
                return HealthCheckResult(
                    service=f"WebSocket: {url}",
                    status="✅ CONNECTED",
                    response_time=response_time,
                    details={"response": response}
                )
        except Exception as e:
            response_time = time.time() - start_time
            return HealthCheckResult(
                service=f"WebSocket: {url}",
                status="❌ CONNECTION FAILED",
                response_time=response_time,
                details={"error": str(e)}
            )

    def check_file_operations(self) -> List[HealthCheckResult]:
        """Check file read/write latency"""
        results = []
        
        # Test file write
        start_time = time.time()
        try:
            test_content = f"Health check test - {datetime.now().isoformat()}"
            with open("test_write.txt", "w") as f:
                f.write(test_content)
            write_time = time.time() - start_time
            
            results.append(HealthCheckResult(
                service="File Write",
                status="✅ SUCCESS",
                response_time=write_time,
                details={"file": "test_write.txt", "size": len(test_content)}
            ))
        except Exception as e:
            write_time = time.time() - start_time
            results.append(HealthCheckResult(
                service="File Write",
                status="❌ FAILED",
                response_time=write_time,
                details={"error": str(e)}
            ))

        # Test file read
        start_time = time.time()
        try:
            with open("test_write.txt", "r") as f:
                content = f.read()
            read_time = time.time() - start_time
            
            results.append(HealthCheckResult(
                service="File Read",
                status="✅ SUCCESS",
                response_time=read_time,
                details={"file": "test_write.txt", "content_length": len(content)}
            ))
        except Exception as e:
            read_time = time.time() - start_time
            results.append(HealthCheckResult(
                service="File Read",
                status="❌ FAILED",
                response_time=read_time,
                details={"error": str(e)}
            ))

        # Cleanup
        try:
            os.remove("test_write.txt")
        except:
            pass

        return results

    async def run_all_checks(self):
        """Run all health checks"""
        print("🔧 Starting Agent Health Check...")
        print("=" * 50)
        
        # Check API endpoints
        print("\n📡 Checking API Endpoints...")
        api_tasks = [self.check_api_endpoint(url) for url in self.config["api_endpoints"]]
        api_results = await asyncio.gather(*api_tasks)
        self.results.extend(api_results)

        # Check WebSocket endpoints
        print("\n🔌 Checking WebSocket Connections...")
        ws_tasks = [self.check_websocket(url) for url in self.config["websocket_endpoints"]]
        ws_results = await asyncio.gather(*ws_tasks)
        self.results.extend(ws_results)

        # Check file operations
        print("\n📁 Checking File Operations...")
        file_results = self.check_file_operations()
        self.results.extend(file_results)

        # Generate report
        self.generate_report()

    def generate_report(self):
        """Generate and display health check report"""
        print("\n" + "=" * 50)
        print("📊 HEALTH CHECK REPORT")
        print("=" * 50)
        
        healthy_count = sum(1 for r in self.results if "✅" in r.status)
        total_count = len(self.results)
        
        print(f"Overall Status: {healthy_count}/{total_count} services healthy")
        print(f"Timestamp: {datetime.now().isoformat()}")
        print("\n" + "-" * 50)
        
        for result in self.results:
            print(f"\n{result.service}")
            print(f"Status: {result.status}")
            print(f"Response Time: {result.response_time:.3f}s")
            if result.details:
                print(f"Details: {json.dumps(result.details, indent=2)}")
        
        print("\n" + "=" * 50)
        
        # Save report to file
        report_data = {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "healthy": healthy_count,
                "total": total_count,
                "success_rate": f"{(healthy_count/total_count)*100:.1f}%"
            },
            "results": [
                {
                    "service": r.service,
                    "status": r.status,
                    "response_time": r.response_time,
                    "details": r.details
                }
                for r in self.results
            ]
        }
        
        with open("health_report.json", "w") as f:
            json.dump(report_data, f, indent=2)
        
        print(f"📄 Report saved to: health_report.json")

async def main():
    checker = AgentHealthChecker()
    await checker.run_all_checks()

if __name__ == "__main__":
    asyncio.run(main())

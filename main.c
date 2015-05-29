/*
 *  Copyright (c) 2015, Parse, LLC. All rights reserved.
 *
 *  You are hereby granted a non-exclusive, worldwide, royalty-free license to use,
 *  copy, modify, and distribute this software in source code or binary form for use
 *  in connection with the web services and APIs provided by Parse.
 *
 *  As with any software that integrates with the Parse platform, your use of
 *  this software is subject to the Parse Terms of Service
 *  [https://www.parse.com/about/terms]. This copyright notice shall be
 *  included in all copies or substantial portions of the software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 *  FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 *  COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 *  IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 *  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

#include <stdio.h>
#include <parse.h>
#include <stdlib.h>


#define APP_ID "nY0HiZQtocZRfntFhdlDdfs03aChMAq68WGxtny9"
#define CLIENT_KEY "crHi4dhJDi5GIzxWaIHW4XrvNBvbtvDlVFuQpIJm"

void myPushCallback(ParseClient client, int error, const char *buffer) {
	if (error == 0 && buffer != NULL) {
		if (strstr(buffer, "calendar") != NULL) {
			printf("received push, -calendar-, now call Google API\n");
			
			system("node calendar.js");
			
			printf("Now speak it out\n");
			system("./speech.sh $(cat calendar.txt)");
			
			printf("query top news from New York Times\n");
			system("node news.js");
			
			printf("read out news\n");
			system("./speech.sh $(cat news.txt)");
		}
		else if(strstr(buffer, "weather") != NULL){
			printf("received push, -weather-, now call weather API\n");
		}
	}
}


int main(int argc, char *argv[]) {
	
	ParseClient client = parseInitialize(APP_ID, CLIENT_KEY);
	
	parseSetPushCallback(client, myPushCallback);
	parseStartPushService(client);
	parseRunPushLoop(client);
	
	return 0;
}

